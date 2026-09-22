//+------------------------------------------------------------------+
//| VoltBridge.mq5 — live MT5 bridge for VOLT desk                   |
//| Polls the authenticated VOLT command queue and executes trades.  |
//+------------------------------------------------------------------+
#property strict
#property copyright "VOLT"
#property version   "1.50"

#include <Trade/Trade.mqh>

input string InpDeskUrl = "https://volt-telegram-trading-terminal.vercel.app";
input string InpToken   = "";
input int    InpPollMs  = 1000;
input int    InpMagic   = 20250922;

CTrade trade;
datetime g_lastHeartbeat = 0;

string AuthHeader()
{
   return "Authorization: Bearer " + InpToken + "\r\n" +
          "X-Volt-Login: " + IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN)) + "\r\n" +
          "X-Volt-Platform: MT5\r\n" +
          "Content-Type: application/json\r\n";
}

bool PostJson(const string path, const string body, string &response)
{
   if(StringLen(InpToken) == 0)
   {
      Print("VOLT: Bridge token is empty.");
      return false;
   }

   char data[];
   char result[];
   string result_headers = "";
   StringToCharArray(body, data, 0, WHOLE_ARRAY, CP_UTF8);
   if(ArraySize(data) > 0) ArrayResize(data, ArraySize(data) - 1);

   ResetLastError();
   int code = WebRequest("POST", InpDeskUrl + path, AuthHeader(), 8000, data, result, result_headers);
   if(code < 200 || code >= 300)
   {
      Print("VOLT: WebRequest ", path, " HTTP=", code, " err=", GetLastError());
      return false;
   }
   response = CharArrayToString(result, 0, -1, CP_UTF8);
   return true;
}

string JsonString(const string json, const string key)
{
   string needle = "\"" + key + "\":";
   int p = StringFind(json, needle);
   if(p < 0) return "";
   p += StringLen(needle);
   while(p < StringLen(json) && (StringGetCharacter(json,p) == ' ' || StringGetCharacter(json,p) == '\t')) p++;
   if(p >= StringLen(json) || StringGetCharacter(json,p) != '"') return "";
   p++;
   int e = p;
   while(e < StringLen(json))
   {
      if(StringGetCharacter(json,e) == '"' && (e == p || StringGetCharacter(json,e-1) != '\\')) break;
      e++;
   }
   return e > p ? StringSubstr(json,p,e-p) : "";
}

double JsonNumber(const string json, const string key, const double fallback=0.0)
{
   string needle = "\"" + key + "\":";
   int p = StringFind(json, needle);
   if(p < 0) return fallback;
   p += StringLen(needle);
   while(p < StringLen(json) && (StringGetCharacter(json,p) == ' ' || StringGetCharacter(json,p) == '\t')) p++;
   int e = p;
   while(e < StringLen(json))
   {
      ushort c = StringGetCharacter(json,e);
      if((c >= '0' && c <= '9') || c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E') e++;
      else break;
   }
   if(e <= p) return fallback;
   return StringToDouble(StringSubstr(json,p,e-p));
}

int JsonInt(const string json, const string key, const int fallback=0)
{
   return (int)MathRound(JsonNumber(json,key,(double)fallback));
}

string NextObject(const string json, int &cursor)
{
   int start = StringFind(json, "{", cursor);
   if(start < 0) return "";
   int depth = 0;
   bool quoted = false;
   for(int i=start; i<StringLen(json); i++)
   {
      ushort c = StringGetCharacter(json,i);
      if(c == '"' && (i == 0 || StringGetCharacter(json,i-1) != '\\')) quoted = !quoted;
      if(quoted) continue;
      if(c == '{') depth++;
      if(c == '}')
      {
         depth--;
         if(depth == 0)
         {
            cursor = i + 1;
            return StringSubstr(json,start,i-start+1);
         }
      }
   }
   cursor = StringLen(json);
   return "";
}

double NormalizeLots(const string symbol, double lots)
{
   double minLot = SymbolInfoDouble(symbol,SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(symbol,SYMBOL_VOLUME_MAX);
   double step   = SymbolInfoDouble(symbol,SYMBOL_VOLUME_STEP);
   if(step <= 0) step = minLot > 0 ? minLot : 0.01;
   lots = MathMax(minLot, MathMin(maxLot, lots));
   lots = MathFloor(lots / step + 1e-8) * step;
   return NormalizeDouble(lots, 8);
}

bool SendFill(const string commandId, const string eventName, const long ticket,
              const string symbol, const string side, const double lots, const double price, const double profit)
{
   string body = StringFormat(
      "{\"commandId\":\"%s\",\"login\":\"%I64d\",\"platform\":\"MT5\",\"ticket\":\"%I64d\",\"event\":\"%s\",\"symbol\":\"%s\",\"side\":\"%s\",\"lots\":%.8f,\"price\":%.8f,\"profit\":%.8f}",
      commandId,
      (long)AccountInfoInteger(ACCOUNT_LOGIN),
      ticket,
      eventName,
      symbol,
      side,
      lots,
      price,
      profit
   );
   string response;
   return PostJson("/api/bridge/fill",body,response);
}

bool ExecuteCommand(const string object)
{
   string commandId = JsonString(object,"id");
   string type      = JsonString(object,"type");
   string payload   = JsonString(object,"payload");
   if(payload == "")
   {
      int pp = StringFind(object,"\"payload\":");
      if(pp >= 0) payload = StringSubstr(object,pp+10);
   }

   if(type != "open_market")
   {
      Print("VOLT: Unsupported command type ",type);
      return false;
   }

   string symbol = JsonString(payload,"symbol");
   string side   = JsonString(payload,"side");
   double lots   = JsonNumber(payload,"lots",0.0);
   double sl     = JsonNumber(payload,"sl",0.0);
   double tp     = JsonNumber(payload,"tp",0.0);
   int magic     = JsonInt(payload,"magic",InpMagic);
   string comment= JsonString(payload,"comment");
   if(symbol == "" || lots <= 0) return false;

   if(!SymbolSelect(symbol,true))
   {
      Print("VOLT: Cannot select symbol ",symbol);
      SendFill(commandId,"failed",0,symbol,side,lots,0,0);
      return false;
   }

   trade.SetExpertMagicNumber((ulong)magic);
   trade.SetTypeFillingBySymbol(symbol);
   lots = NormalizeLots(symbol,lots);

   bool ok = false;
   if(side == "buy")
      ok = trade.Buy(lots,symbol,0.0,sl,tp,comment);
   else if(side == "sell")
      ok = trade.Sell(lots,symbol,0.0,sl,tp,comment);

   long ticket = (long)trade.ResultDeal();
   if(ticket <= 0) ticket = (long)trade.ResultOrder();

   double price = trade.ResultPrice();
   if(price <= 0)
      price = side == "buy" ? SymbolInfoDouble(symbol,SYMBOL_ASK) : SymbolInfoDouble(symbol,SYMBOL_BID);

   if(!ok)
   {
      Print("VOLT: trade failed ",trade.ResultRetcode()," ",trade.ResultRetcodeDescription());
      SendFill(commandId,"failed",ticket,symbol,side,lots,price,0);
      return false;
   }

   Print("VOLT: executed ",side," ",lots," ",symbol," ticket=",ticket);
   SendFill(commandId,"opened",ticket,symbol,side,lots,price,0);
   return true;
}

void ProcessCommands(const string response)
{
   int cursor = 0;
   while(true)
   {
      string object = NextObject(response,cursor);
      if(object == "") break;
      string type = JsonString(object,"type");
      if(type == "open_market")
         ExecuteCommand(object);
   }
}

void SendHeartbeat()
{
   string body = StringFormat(
      "{\"login\":\"%I64d\",\"platform\":\"MT5\",\"server\":\"%s\",\"broker\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"eaVersion\":\"1.5.0\",\"pingMs\":0}",
      (long)AccountInfoInteger(ACCOUNT_LOGIN),
      AccountInfoString(ACCOUNT_SERVER),
      AccountInfoString(ACCOUNT_COMPANY),
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      AccountInfoDouble(ACCOUNT_MARGIN)
   );

   string response;
   if(PostJson("/api/bridge/heartbeat",body,response))
   {
      g_lastHeartbeat = TimeCurrent();
      ProcessCommands(response);
   }
}

int OnInit()
{
   if(StringLen(InpDeskUrl) == 0 || StringLen(InpToken) == 0)
   {
      Print("VOLT: set InpDeskUrl and InpToken before enabling live execution.");
      return INIT_PARAMETERS_INCORRECT;
   }
   EventSetMillisecondTimer(MathMax(250,InpPollMs));
   SendHeartbeat();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   SendHeartbeat();
}

void OnTick()
{
}
