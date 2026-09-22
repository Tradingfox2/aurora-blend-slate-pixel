//+------------------------------------------------------------------+
//| VoltBridge.mq4 — Expert Advisor for VOLT desk (MT4)             |
//| Compile in MetaEditor MT4. Configure token + desk URL in inputs. |
//+------------------------------------------------------------------+
#property copyright "VOLT"
#property version   "1.40"
#property strict

input string InpDeskUrl   = "https://YOUR-DEPLOY.vercel.app";
input string InpToken     = "volt_live_demo";
input int    InpPollMs    = 400;
input int    InpMagic     = 20250922;

datetime g_lastHeartbeat = 0;

string AuthHeader()
{
   return "Authorization: Bearer " + InpToken + "\r\n" +
          "X-Volt-Login: " + IntegerToString(AccountLogin()) + "\r\n" +
          "X-Volt-Platform: MT4\r\n" +
          "Content-Type: application/json\r\n";
}

bool PostJson(const string path, const string body, string &response)
{
   char data[];
   char result[];
   string headers = AuthHeader();
   StringToCharArray(body, data, 0, WHOLE_ARRAY, CP_UTF8);
   string url = InpDeskUrl + path;
   int code = WebRequest("POST", url, headers, 5000, data, result, headers);
   if(code == -1)
   {
      Print("WebRequest failed: ", GetLastError(), " — allow URL in Tools → Options → Expert Advisors");
      return false;
   }
   response = CharArrayToString(result);
   return true;
}

void SendHeartbeat()
{
   string body = StringFormat(
      "{\"login\":\"%d\",\"platform\":\"MT4\",\"server\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,\"eaVersion\":\"1.4.2\",\"pingMs\":0}",
      (int)AccountLogin(),
      AccountServer(),
      AccountBalance(),
      AccountEquity(),
      AccountMargin()
   );
   string resp;
   if(PostJson("/api/bridge/heartbeat", body, resp))
      g_lastHeartbeat = TimeCurrent();
}

int OnInit()
{
   EventSetMillisecondTimer(InpPollMs);
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
