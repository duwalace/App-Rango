import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, AlertTriangle, Bell } from "lucide-react";

export default function OperationsSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operações e Suporte</h1>
        <p className="text-muted-foreground">Central de suporte e operações da plataforma</p>
      </div>

      <Tabs defaultValue="support" className="w-full">
        <TabsList>
          <TabsTrigger value="support">
            <MessageSquare className="h-4 w-4 mr-2" />
            Central de Suporte
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Moderação
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Tickets de Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Sistema de tickets será implementado aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderação de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Fila de moderação será implementada aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Envio de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Sistema de notificações em massa será implementado aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

