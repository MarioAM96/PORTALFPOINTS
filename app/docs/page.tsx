"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { InputOtp } from "@heroui/input-otp";
import { useForm, Controller } from "react-hook-form";
import { Select } from "@heroui/select";
import CustomButton from "../../components/custom-button";
import { SelectItem } from "@heroui/select";
import confetti from "canvas-confetti";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
} from "@heroui/react";
import React, { useState, useRef } from "react";

interface ClientData {
  nombre_cliente: string;
  contrato: number;
  idCiudad: string;
  idZona: string;
  tipoServicio: string;
  direccion: string;
  max_actualpoints: number;
}
interface ProductData {
  idcausal_subcategoria: number;
  nombre_causal: string;
  idsubcategoria_incidencia: string;
  estado_causal: string;
  fecha_registro_causal: string;
  usuario_registra_causal?: string | null;
  valor?: string | null;
  puntos: string;
  image_url: string;
}

export default function DocsPage() {
  const [identificacion, setIdentificacion] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [otpCode, setOtpCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const confettiButtonRef = useRef<HTMLButtonElement>(null);
  const [consultaRealizada, setConsultaRealizada] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
    });
  };
  const [termsAccepted, setTermsAccepted] = useState(false);
  const handleProductSelect = (product: ProductData) => {
    setSelectedProduct(product);
    setTermsAccepted(false);
    onOpen();
  };

  const handleConfirm = async (onClose: () => void) => {
    if (termsAccepted && selectedProduct && selectedClient) {
      try {
        const now = new Date();
        const fecha_insidencia = now.toISOString().slice(0, 16);
        const hora_ini_op = now.toTimeString().slice(0, 8);
        const finOpDate = new Date(now.getTime() + 5 * 60000);
        const hora_fin_op = finOpDate.toTimeString().slice(0, 8);

        let visita = false;
        let estado_ticket = 1;
        let departamento = 6;

        if (selectedProduct.idcausal_subcategoria === 119) {
          departamento = 13;
        }

        const payload = {
          canal_comunicacion: "5",
          estado: estado_ticket,
          facturada: "SI",
          fecha_insidencia: fecha_insidencia,
          hora_fin_op: hora_fin_op,
          hora_ini_op: hora_ini_op,
          idCiudad: selectedClient.idCiudad,
          idContrato: selectedClient.contrato,
          id_departamento: departamento,
          id_usuario_gestiona: "187",
          idcausal_subcategoria: selectedProduct.idcausal_subcategoria,
          idsubcategoria_incidencia: selectedProduct.idsubcategoria_incidencia,
          insidencia: 229,
          observaciones: "Canje FibraPoints Web",
          prioridad: "Alta",
          requiere_visita: visita,
          tecnico: 6,
          tiempo_op: "00:00:01",
          tipo_servicio: "2",
          usuario: "187",
          valor_facturar: "0.00",
          zona: selectedClient.idZona,
          code: otpCode,
        };

        const response = await fetch(
          "https://api.tvmax.ec/api/nuevo-ticket-cf",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || "Error en la solicitud.";
          throw new Error(errorMessage);
        }

        const data = await response.json();

        addToast({
          title: "Canje exitoso",
          description:
            "El canje se ha generado exitosamente. En el transcurso del día, un asesor se comunicará con usted para gestionar la entrega de la promoción.",
          color: "success",
        });
        triggerConfetti();

        // Resetear todos los estados
        onClose();
        setIdentificacion("");
        setSelectedProduct(null);
        setSelectedClient(null);
        setTermsAccepted(false);
        setOtpCode("");
        setShowOtpForm(false);
        setShowSelect(false);
        setClients([]);
        setProducts([]);
      } catch (error) {
        console.error("Error:", error);

        addToast({
          title: "Error en el canje",
          description:
            error instanceof Error ? error.message : "Error desconocido",
          color: "danger",
        });
      }
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    reset: resetOtpForm,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showSelect, setShowSelect] = useState(false);

  const onSubmitotp = async (data: { otp: string }) => {
    try {
      setOtpCode(data.otp);
      // Set loading state
      setLoading(true);

      // Make POST request to verify OTP
      const response = await fetch(
        "https://api.tvmax.ec/api/verificar-codigo-fibrapoints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identificacion: identificacion, // Use the identificacion from state
            codigo: data.otp, // Use the OTP entered by user
          }),
        }
      );

      // Parse the response
      const result = await response.json();
      //console.log(result);
      // Handle different response scenarios
      if (result.message) {
        if (
          !Array.isArray(result.message) &&
          result.message.startsWith("No se encontraton fibrapuntos activos")
        ) {
          addToast({
            title: "Mensaje",
            description: result.message,
            color: "warning",
          });
          // Additional success logic (e.g., navigation, state update)
        }
        if (result.status === 200 && result.message.length > 0) {
          addToast({
            title: "Mensaje",
            description: "Código verificado correctamente",
            color: "success",
          });
          setClients(result.message);
          getProducts();
          setShowOtpForm(false);
          setShowSelect(true);
          resetOtpForm();
        } else {
          addToast({
            title: "Error",
            description: result.message,
            color: "danger",
          });
        }
      }
    } catch (error) {
      //console.log("RR", error);
      // Handle network or other errors
      addToast({
        title: "Error",
        description: "Error al verificar el código. Intente nuevamente.",
        color: "danger",
      });
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/\D/g, "");
    setIdentificacion(value);
    setShowOtpForm(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate input
    if (!identificacion) {
      setErrors({ identificacion: "Identificación es requerida" });
      setLoading(false);
      return;
    }

    // Validate length (only 10 or 13 characters)
    if (![10, 13].includes(identificacion.length)) {
      setErrors({
        identificacion: "La identificación debe tener 10 o 13 dígitos",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.tvmax.ec/api/obtener-codigo-fibrapoints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identificacion: identificacion,
            ip: "200.63.105.162",
          }),
        }
      );

      const result = await response.json();

      if (
        result.message &&
        result.message.startsWith(
          "Debido a que tu contrato incluye una promoción del 50%"
        )
      ) {
        addToast({
          title: "Mensaje",
          description: result.message,
          color: "danger",
        });
      } else if (
        result.message &&
        result.message.startsWith("No se ha podido solicitar el")
      ) {
        addToast({
          title: "Mensaje",
          description:
            result.message +
            ". Por favor revisa que la identificación sea correcta",
          color: "danger",
        });
      } else if (
        result.message &&
        result.message.startsWith("Ya ha solicitado un código anteriormente")
      ) {
        addToast({
          title: "Mensaje",
          description: result.message,
          color: "warning",
        });
      } else if (
        result.message &&
        result.message.startsWith(
          "Se ha enviado un código de 6 dígitos a su correo"
        )
      ) {
        addToast({
          title: "Mensaje",
          description: result.message,
          color: "success",
        });
        setShowOtpForm(true);
        setConsultaRealizada(true);
      } else {
        addToast({
          title: "Mensaje",
          description: result.message,
          color: "danger",
        });
      }
    } catch (error) {
      setErrors({
        identificacion: "Error de conexión. Intente nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://api.tvmax.ec/api/get-activeproducts/33",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      //console.log(result);

      // Set products instead of clients
      setProducts(result);
    } catch (error) {
      //console.log("RR", error);
      addToast({
        title: "Error",
        description: "Error al obtener los productos",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const reiniciarProceso = () => {
    setIdentificacion("");
    setErrors({});
    setShowOtpForm(false);
    setShowSelect(false);
    setSelectedClient(null);
    setClients([]);
    setProducts([]);
    setConsultaRealizada(false);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-wrap gap-4 items-start justify-center w-full transition-all duration-300 ease-in-out">
          {/* Contenedor de identificación */}
          <div className="relative overflow-hidden flex flex-col items-center border border-default-200 dark:border-default-100 px-4 py-6 rounded-lg mb-4">
            <p className="mb-4 text-center text-sm text-gray-600">
              Consulta tus puntos disponibles
            </p>
            <Form
              className="w-full max-w-xs flex flex-col gap-3"
              validationErrors={errors}
              onSubmit={onSubmit}
            >
              <Input
                label="Número de Cédula"
                labelPlacement="outside"
                name="identificacion"
                placeholder="Ingrese 10 o 13 dígitos"
                value={identificacion}
                onChange={handleInputChange}
                type="text"
                maxLength={13}
                isDisabled={consultaRealizada}
              />
              <div className="flex gap-2">
                {!consultaRealizada ? (
                  <Button
                    type="submit"
                    variant="flat"
                    isLoading={loading}
                    style={{ backgroundColor: "#FF4D4D", color: "white" }}
                    className="flex-grow"
                  >
                    Consultar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="flat"
                    color="secondary"
                    className="flex-grow"
                    onPress={reiniciarProceso}
                  >
                    Realizar otra Consulta
                  </Button>
                )}
              </div>
            </Form>
          </div>

          {/* Contenedor de OTP */}
          {showOtpForm && (
            <div className="relative overflow-hidden flex items-center border border-default-200 dark:border-default-100 px-4 py-6 rounded-lg mb-4">
              <div className="w-full">
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-600">
                    Se ha enviado un código de verificación:
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Por favor, ingrese el código de 6 dígitos
                  </p>
                </div>
                <form
                  className="flex flex-col gap-4 w-full"
                  onSubmit={handleSubmit(onSubmitotp)}
                >
                  <Controller
                    control={control}
                    name="otp"
                    render={({ field }) => (
                      <InputOtp
                        {...field}
                        errorMessage={formErrors.otp?.message}
                        isInvalid={!!formErrors.otp}
                        length={6}
                      />
                    )}
                    rules={{
                      required: "El código es requerido",
                      minLength: {
                        value: 4,
                        message: "Por favor ingrese el código",
                      },
                    }}
                  />
                  <Button
                    className="max-w-fit mx-auto"
                    type="submit"
                    variant="flat"
                    isLoading={loading}
                  >
                    Verificar Codigo
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Contenedor de Select */}
          {showSelect && (
            <div className="w-full max-w-xs">
              <Select
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  const client = clients.find(
                    (c) => c.contrato === Number(selectedKey)
                  );
                  setSelectedClient(client || null);
                }}
                classNames={{
                  label: "group-data-[filled=true]:-translate-y-5",
                  trigger: "min-h-16",
                  listboxWrapper: "max-h-[400px]",
                }}
                items={clients}
                label="Contrato"
                renderValue={(items) => {
                  return items.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span>{item.data?.nombre_cliente ?? "Unknown"}</span>
                        <span className="text-default-500 text-tiny">
                          Dirección: {item.data?.direccion ?? "N/A"}
                        </span>
                      </div>
                    </div>
                  ));
                }}
                variant="bordered"
              >
                {(client) => (
                  <SelectItem
                    key={client.contrato}
                    textValue={client.nombre_cliente}
                  >
                    <div className="flex flex-col">
                      <span className="text-small">
                        {client.nombre_cliente}
                      </span>
                      <span className="text-tiny text-default-400">
                        Contrato: {client.contrato}
                      </span>
                      <span className="text-tiny text-default-400">
                        Dirección: {client.direccion}
                      </span>
                      <span className="text-tiny text-default-400">
                        Puntos: {client.max_actualpoints}
                      </span>
                    </div>
                  </SelectItem>
                )}
              </Select>
            </div>
          )}

          {/* Contenedor de Card de Cliente */}
          {selectedClient && (
            <div className="w-full max-w-[400px]">
              <Card>
                <CardHeader className="flex gap-3">
                  <div className="bg-default-100 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-default-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-md font-bold">
                      {selectedClient.nombre_cliente}
                    </p>
                    <p className="text-small text-default-500">
                      Contrato: {selectedClient.contrato}
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <p className="text-lg font-bold text-green-600">
                        Puntos Disponibles
                      </p>
                      <p className="text-2xl font-extrabold text-green-800">
                        {selectedClient.max_actualpoints.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Link
                    isExternal
                    showAnchorIcon
                    href={`https://fibramax.ec/wp-content/uploads/2024/11/TERMINOS-Y-CONDICIONES-FIBRAPOINTS.pdf`}
                  >
                    Términos y condiciones
                  </Link>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>

        {/* Sección de Productos */}
        {selectedClient && (
          <div className="w-full mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Productos Disponibles
            </h2>
            <p className="text-center text-xs text-gray-500 mb-4">
              * Las imágenes presentadas son referenciales y pueden variar del
              producto final.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <Card
                  key={product.idcausal_subcategoria}
                  isPressable
                  shadow="sm"
                  onPress={() => handleProductSelect(product)}
                  className="transition-transform duration-300 hover:scale-105"
                >
                  <CardBody className="overflow-visible p-0">
                    <Image
                      alt={product.nombre_causal}
                      className="w-full object-cover h-[140px]"
                      radius="lg"
                      shadow="sm"
                      src={product.image_url}
                      width="100%"
                    />
                  </CardBody>
                  <CardFooter className="text-small justify-between">
                    <b>{product.nombre_causal}</b>
                    <p className="text-default-500">{product.puntos} Puntos</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Producto */}
        <Modal
          isOpen={isOpen}
          placement="top-center"
          onOpenChange={onOpenChange}
          size="2xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedProduct?.nombre_causal}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                      <Image
                        alt={selectedProduct?.nombre_causal}
                        className="w-full object-cover h-[300px] rounded-lg"
                        src={selectedProduct?.image_url}
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="space-y-4">
                        <div>
                          <p className="font-bold">Detalles del Producto:</p>
                          <p>{selectedProduct?.nombre_causal}</p>
                        </div>

                        {/* Sección de Puntos */}
                        <div className="bg-default-100 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-default-700">
                              Puntos Requeridos:
                            </p>
                            <p
                              className={`font-semibold ${
                                (selectedClient?.max_actualpoints ?? 0) <
                                parseInt(selectedProduct?.puntos || "0")
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {selectedProduct?.puntos ?? 0} Puntos
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-default-700">
                              Tus Puntos Actuales:
                            </p>
                            <p
                              className={`font-semibold ${
                                (selectedClient?.max_actualpoints ?? 0) <
                                parseInt(selectedProduct?.puntos || "0")
                                  ? "text-danger"
                                  : "text-success"
                              }`}
                            >
                              {selectedClient
                                ? selectedClient.max_actualpoints
                                : 0}{" "}
                              Puntos
                            </p>
                          </div>

                          {selectedClient &&
                            selectedProduct &&
                            selectedClient.max_actualpoints <
                              parseInt(selectedProduct.puntos) && (
                              <div className="mt-2 text-center">
                                <p className="text-danger text-xs">
                                  Puntos insuficientes para canjear este
                                  producto
                                </p>
                              </div>
                            )}
                        </div>

                        {/* <div>
                          <p className="font-bold">Fecha de Registro:</p>
                          <p>{selectedProduct?.fecha_registro_causal}</p>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <Checkbox
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="
    transition-all 
    duration-200 
    ease-in-out 
    touch-manipulation
    active:scale-105 
    hover:scale-102
  "
                    >
                      Acepto los
                    </Checkbox>
                    <Link
                      isExternal
                      showAnchorIcon
                      href="https://fibramax.ec/wp-content/uploads/2024/11/TERMINOS-Y-CONDICIONES-FIBRAPOINTS.pdf"
                      className="ml-2"
                    >
                      Términos y condiciones
                    </Link>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Atrás
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => handleConfirm(onClose)}
                    isDisabled={
                      !termsAccepted ||
                      !selectedClient ||
                      !selectedProduct ||
                      (selectedClient?.max_actualpoints ?? 0) <
                        parseInt(selectedProduct?.puntos || "0")
                    }
                  >
                    Confirmar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
}
