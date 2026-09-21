import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SYMBOL_IDS, type Side, type SymbolId } from "@/lib/trading/types";
import { useDesk } from "@/lib/trading/store";

export function ManualOrderButton() {
  const accounts = useDesk((s) => s.accounts);
  const placeManual = useDesk((s) => s.placeManual);
  const [open, setOpen] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [symbol, setSymbol] = useState<SymbolId>("XAUUSD");
  const [side, setSide] = useState<Side>("buy");
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Manual order</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual market order</DialogTitle>
          <DialogDescription>Fires on the selected terminal at the current bid/ask.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Symbol</Label>
            <Select value={symbol} onValueChange={(v) => setSymbol(v as SymbolId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SYMBOL_IDS.map((id) => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Side</Label>
            <Select value={side} onValueChange={(v) => setSide(v as Side)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Lots</Label>
            <Input value={lots} onChange={(e) => setLots(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Stop loss</Label>
            <Input value={sl} onChange={(e) => setSl(e.target.value)} placeholder="optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Take profit</Label>
            <Input value={tp} onChange={(e) => setTp(e.target.value)} placeholder="optional" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant={side === "buy" ? "buy" : "sell"}
            onClick={() => {
              placeManual({
                accountId,
                symbol,
                side,
                lots: Number(lots) || 0.01,
                sl: sl ? Number(sl) : undefined,
                tp: tp ? Number(tp) : undefined,
              });
              setOpen(false);
            }}
          >
            Send {side.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
