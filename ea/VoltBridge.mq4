//+------------------------------------------------------------------+
//| VoltBridge.mq4 — live MT4 bridge for VOLT desk                   |
//+------------------------------------------------------------------+
#property strict
#property version "1.50"

extern string InpDeskUrl = "https://volt-telegram-trading-terminal.vercel.app";
extern string InpToken   = "";
extern int    InpPollSec = 1;
extern int    InpMagic   = 20250922;

string AuthHeader()
{
   return "Authorization: Bearer " + InpToken + "\r\n" +
          "X-Volt-Login: " + IntegerToString(AccountNumber()) + "\r\n" +
          "X-Volt-Platform: MT4\r\n" +
          "Content-Type: application/json\r\n";
}

bool PostJson(string path,string body,string &response)
{
   if(StringLen(InpToken)==0) return false;
   char data[],result[];
   string resultHeaders="";
   StringToCharArray(body,data,0,WHOLE_ARRAY,CP_UTF8);
   if(ArraySize(data)>0) ArrayResize(data,ArraySize(data)-1);
   ResetLastError();
   int code=WebRequest("POST",InpDeskUrl+path,AuthHeader(),8000,data,result,resultHeaders);
   if(code<200 || code>=300)
   {
      Print("VOLT: WebRequest ",path," HTTP=",code," err=",GetLastError());
      return false;
   }
   response=CharArrayToString(result,0,-1,CP_UTF8);
   return true;
}

string JsonString(string json,string key)
{
   string needle="\"" + key + "\":";
   int p=StringFind(json,needle);
   if(p<0) return "";
   p+=StringLen(needle);
   while(p<StringLen(json) && (StringGetCharacter(json,p)==' ' || StringGetCharacter(json,p)=='\t')) p++;
   if(p>=StringLen(json) || StringGetCharacter(json,p)!='"') return "";
   p++;
   int e=p;
   while(e<StringLen(json))
   {
      if(StringGetCharacter(json,e)=='"' && StringGetCharacter(json,e-1)!='\\') break;
      e++;
   }
   return e>p ? StringSubstr(json,p,e-p) : "";
}

double JsonNumber(string json,string key,double fallback=0)
{
   string needle="\"" + key + "\":";
   int p=StringFind(json,needle);
   if(p<0) return fallback;
   p+=StringLen(needle);
   while(p<StringLen(json) && (StringGetCharacter(json,p)==' ' || StringGetCharacter(json,p)=='\t')) p++;
   int e=p;
   while(e<StringLen(json))
   {
      int c=StringGetCharacter(json,e);
      if((c>='0' && c<='9') || c=='-' || c=='+' || c=='.' || c=='e' || c=='E') e++;
      else break;
   }
   return e>p ? StrToDouble(StringSubstr(json,p,e-p)) : fallback;
}

string PayloadFromCommand(string response)
{
   int p=StringFind(response,"\"payload\":");
   if(p<0) return "";
   p+=10;
   while(p<StringLen(response) && StringGetCharacter(response,p)!='{') p++;
   if(p>=StringLen(response)) return "";
   int depth=0;
   bool quoted=false;
   for(int i=p;i<StringLen(response);i++)
   {
      int c=StringGetCharacter(response,i);
      if(c=='"' && (i==0 || StringGetCharacter(response,i-1)!='\\')) quoted=!quoted;
      if(quoted) continue;
      if(c=='{') depth++;
      if(c=='}')
      {
         depth--;
         if(depth==0) return StringSubstr(response,p,i-p+1);
      }
   }
   return "";
}

void SendFill(string commandId,string eventName,int ticket,string symbol,string side,double lots,double price,double profit)
{
   string body=StringFormat(
      "{\"commandId\":\"%s\",\"login\":\"%d\",\"platform\":\"MT4\",\"ticket\":\"%d\",\"event\":\"%s\",\"symbol\":\"%s\",\"side\":\"%s\",\"lots\":%.8f,\"price\":%.8f,\"profit\":%.8f}",
      commandId,AccountNumber(),ticket,eventName,symbol,side,lots,price,profit);
   string response;
   PostJson("/api/bridge/fill",body,response);
}

void ProcessHeartbeat(string response)
{
   string commandId=JsonString(response,"id");
   string type=JsonString(response,"type");
   if(type!="open_market") return;

   string payload=PayloadFromCommand(response);
   string symbol=JsonString(payload,"symbol");
   string side=JsonString(payload,"side");
   double lots=JsonNumber(payload,"lots",0);
   double sl=JsonNumber(payload,"sl",0);
   double tp=JsonNumber(payload,"tp",0);
   int magic=(int)MathRound(JsonNumber(payload,"magic",InpMagic));
   string comment=JsonString(payload,"comment");
   if(symbol=="" || lots<=0) return;

   RefreshRates();
   double price=(side=="buy") ? MarketInfo(symbol,MODE_ASK) : MarketInfo(symbol,MODE_BID);
   int cmd=(side=="buy") ? OP_BUY : OP_SELL;
   int digits=(int)MarketInfo(symbol,MODE_DIGITS);
   price=NormalizeDouble(price,digits);
   if(sl>0) sl=NormalizeDouble(sl,digits);
   if(tp>0) tp=NormalizeDouble(tp,digits);

   int ticket=OrderSend(symbol,cmd,lots,price,10,sl,tp,comment,magic,0,clrNONE);
   if(ticket<0)
   {
      Print("VOLT: OrderSend failed err=",GetLastError());
      SendFill(commandId,"failed",0,symbol,side,lots,price,0);
      return;
   }
   Print("VOLT: executed ",side," ",lots," ",symbol," ticket=",ticket);
   SendFill(commandId,"opened",ticket,symbol,side,lots,price,0);
}

void SendState()
{
   string positions="[";
   bool first=true;
   for(int i=OrdersTotal()-1;i>=0;i--)
   {
      if(!OrderSelect(i,SELECT_BY_POS,MODE_TRADES)) continue;
      int type=OrderType();
      if(type!=OP_BUY && type!=OP_SELL) continue;
      if(!first) positions+=",";
      first=false;
      string side=(type==OP_BUY) ? "buy" : "sell";
      positions+=StringFormat("{\"ticket\":\"%d\",\"symbol\":\"%s\",\"side\":\"%s\",\"lots\":%.8f,\"openPrice\":%.8f,\"sl\":%.8f,\"tp\":%.8f,\"magic\":%d,\"comment\":\"%s\",\"profit\":%.8f,\"openTime\":%d}",
         OrderTicket(),OrderSymbol(),side,OrderLots(),OrderOpenPrice(),OrderStopLoss(),OrderTakeProfit(),
         OrderMagicNumber(),OrderComment(),OrderProfit()+OrderSwap()+OrderCommission(),OrderOpenTime());
   }
   positions+="]";
   string body=StringFormat("{\"login\":\"%d\",\"platform\":\"MT4\",\"positions\":%s,\"orders\":[]}",
      AccountNumber(),positions);
   string response;
   PostJson("/api/bridge/state",body,response);
}

void Heartbeat()
{
   string body=StringFormat(
      "{\"login\":\"%d\",\"platform\":\"MT4\",\"server\":\"%s\",\"broker\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"eaVersion\":\"1.5.0\",\"pingMs\":0}",
      AccountNumber(),AccountServer(),AccountCompany(),AccountBalance(),AccountEquity(),AccountMargin());

   string response;
   if(PostJson("/api/bridge/heartbeat",body,response))
   {
      ProcessHeartbeat(response);
      SendState();
   }
}

int OnInit()
{
   if(StringLen(InpDeskUrl)==0 || StringLen(InpToken)==0)
   {
      Print("VOLT: set InpDeskUrl and InpToken before enabling live execution.");
      return(INIT_PARAMETERS_INCORRECT);
   }
   EventSetTimer(MathMax(1,InpPollSec));
   Heartbeat();
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   Heartbeat();
}

void OnTick()
{
}
