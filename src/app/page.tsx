"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Phone,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormData = {
  cedula: string;
  telefono: string;
  tiempo_notificacion?: string;
};

export default function Component() {
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (
    data: FormData,
    isDelete: boolean = false
  ): string | null => {
    if (!/^\d{10}$/.test(data.cedula)) {
      return "La cédula debe tener 10 dígitos";
    }
    if (!/^09\d{8}$/.test(data.telefono)) {
      return "El teléfono debe tener el formato 09XXXXXXXX";
    }
    if (!isDelete && !data.tiempo_notificacion) {
      return "Debe seleccionar un tiempo de notificación";
    }
    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    isDelete: boolean = false
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = Object.fromEntries(
      new FormData(e.currentTarget)
    ) as FormData;
    const error = validateForm(formData, isDelete);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: error,
        action: <X className="h-4 w-4" />,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.lxndr.dev/energizame/" +
          (isDelete ? "eliminar" : "agregar"),
        {
          method: isDelete ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.error) {
        toast({
          variant: "destructive",
          title: "No encontrado",
          description: "No hay notificaciones registradas para esta cédula",
          action: <AlertCircle className="h-4 w-4" />,
        });
        return;
      }

      if (data.message) {
        toast({
          title: isDelete ? "Notificación eliminada" : "Notificación agregada",
          description: isDelete
            ? "Se han eliminado todas las notificaciones para esta cédula"
            : "Se han configurado correctamente las notificaciones",
          action: <Check className="h-4 w-4 text-green-500" />,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Ocurrió un error al procesar la solicitud. Por favor, intente nuevamente.",
        action: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const timeOptions = Array.from({ length: 12 }, (_, i) => ({
    value: `${String((i + 1) * 5)} minutos`,
    label: `${(i + 1) * 5} minutos${(i + 1) * 5 === 60 ? " (1 hora)" : ""}`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sistema de Notificaciones
          </CardTitle>
          <CardDescription className="text-center">
            Gestiona tus notificaciones de cortes de energía
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agregar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="agregar"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Notificación
              </TabsTrigger>
              <TabsTrigger
                value="eliminar"
                className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Notificación
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agregar">
              <div className="mb-6">
                <Alert>
                  <Plus className="h-4 w-4" />
                  <AlertTitle>Modo Agregar</AlertTitle>
                  <AlertDescription>
                    Ingrese sus datos para recibir notificaciones sobre los
                    cortes de energía.
                  </AlertDescription>
                </Alert>
              </div>

              <form
                onSubmit={(e) => handleSubmit(e, false)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cedula-add"
                      className="flex items-center gap-2"
                    >
                      <UserRound className="h-4 w-4" />
                      Cédula
                    </Label>
                    <Input
                      id="cedula-add"
                      name="cedula"
                      placeholder="Ingrese su número de cédula"
                      maxLength={10}
                      className="transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="telefono-add"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="telefono-add"
                      name="telefono"
                      placeholder="09XXXXXXXX"
                      maxLength={10}
                      className="transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tiempo de notificación (tiempo antes del corte)
                    </Label>
                    <RadioGroup
                      name="tiempo_notificacion"
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`time-${option.value}`}
                            className="border-primary text-primary"
                          />
                          <Label
                            htmlFor={`time-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Agregar Notificación
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="eliminar">
              <div className="mb-6">
                <Alert variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  <AlertTitle>Modo Eliminar</AlertTitle>
                  <AlertDescription>
                    Ingrese sus datos para eliminar las notificaciones
                    existentes.
                  </AlertDescription>
                </Alert>
              </div>

              <form
                onSubmit={(e) => handleSubmit(e, true)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cedula-delete"
                      className="flex items-center gap-2"
                    >
                      <UserRound className="h-4 w-4" />
                      Cédula
                    </Label>
                    <Input
                      id="cedula-delete"
                      name="cedula"
                      placeholder="Ingrese su número de cédula"
                      maxLength={10}
                      className="transition-colors focus:border-destructive"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="telefono-delete"
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="telefono-delete"
                      name="telefono"
                      placeholder="09XXXXXXXX"
                      maxLength={10}
                      className="transition-colors focus:border-destructive"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar Notificación
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
