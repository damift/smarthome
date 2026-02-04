import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginCard() {
  return (
    <>
    
    <Card className="w-full max-w-sm">
        <div className="p-4 border-b flex justify-center">
            <div className="p-4 border-2">
                Smart Home System  
            </div>      
        </div>
      <CardHeader>
        <CardTitle>Inloggen</CardTitle>
        <CardDescription>
          Log in met je e-mail en wachtwoord om door te gaan.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="naam@voorbeeld.nl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Wachtwoord</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" type="button">
          Inloggen
        </Button>

          <a className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="#">Wachtwoord vergeten?</a>
        
      </CardFooter>
    </Card>
    </>
  );
}
