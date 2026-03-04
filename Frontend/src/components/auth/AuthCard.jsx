import { Card, CardContent } from "@/components/shadcn/card";

export default function AuthCard({ title = "Smart Home System", subtitle, children }) {
  return (
    // Herbruikbare auth-container voor login/register varianten.
    <Card className="mx-auto w-[min(520px,92vw)] rounded-none border-2 border-black bg-white text-black shadow-none">
      <CardContent className="max-h-[90vh] overflow-auto px-6 py-6 sm:px-10 sm:py-10">
        <div className="flex justify-center">
          <div className="border-2 border-black px-10 py-4 text-xl font-medium">
            {title}
          </div>
        </div>

        {subtitle && <div className="mt-6 text-center text-sm">{subtitle}</div>}

        {children}
      </CardContent>
    </Card>
  );
}
