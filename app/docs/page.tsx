"use client";

import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { InputOtp } from "@heroui/input-otp";
import { useForm, Controller } from "react-hook-form";
import { Select } from "@heroui/select";
import { SelectItem } from "@heroui/select";
import confetti from "canvas-confetti";
import { fetchData, postData } from "@/services/apiService";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import React, { useState } from "react";
import HistorialTable from "./HistorialTable/historialtable";
import { ClientData } from "./Models/ClientData";
import { ProductData } from "./Models/ProductData";
import ConfirmModal from "./Modals/ConfirmModal";
import SuccessModal from "./Modals/SuccessModal";

export default function FibraPointsPage() {
  const [identificacion, setIdentificacion] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onOpenChange: onOpenChangeConfirm,
  } = useDisclosure();

  const {
    isOpen: isOpenSuccess,
    onOpen: onOpenSuccess,
    onOpenChange: onOpenChangeSuccess,
  } = useDisclosure();
  const [otpCode, setOtpCode] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const triggerConfetti = () => {
    confetti({
      particleCount: 1000,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
    });
  };
  const [termsAccepted, setTermsAccepted] = useState(false);
  const handleProductSelect = (product: ProductData) => {
    setSelectedProduct(product);
    setTermsAccepted(false);
    onOpenConfirm();
  };

  const handleConfirm = async (onClose: () => void) => {
    if (!termsAccepted || !selectedProduct || !selectedClient) return;

    if (!otpCode || otpCode.length !== 6) {
      addToast({
        title: "Código inválido",
        description: "Por favor, ingrese un código OTP válido de 6 dígitos.",
        color: "danger",
      });
      return;
    }

    setLoading(true);
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

      const ticketData = {
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

      const response = await postData("nuevo-ticket-cf", ticketData);

      // Verificar si la respuesta indica un error
      if (
        !response ||
        response.error ||
        (response.status && response.status !== 200)
      ) {
        throw new Error(response?.message || "Error al crear el ticket.");
      }

      addToast({
        title: "Canje exitoso",
        description:
          "El canje se ha generado exitosamente. En el transcurso del día, un asesor se comunicará con usted para gestionar la entrega de la promoción.",
        color: "success",
      });
      onClose();
      onOpenSuccess();
      const puntosBloqueados = await GetPuntosBloqueados(
        selectedClient.contrato
      );
      if (puntosBloqueados) {
        selectedClient.max_actualpoints = puntosBloqueados;
      }
      handleReload();
      triggerConfetti();
      for (let i = 1; i < 4; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        triggerConfetti();
      }
      //reiniciarProceso();
    } catch (error) {
      console.error("Error al procesar el canje:", error);
      let errorMessage = "Error desconocido al procesar el canje.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
      ) {
        errorMessage = (error as { message: string }).message;
      }
      addToast({
        title: "Error en el canje",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setLoading(false);
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

  const handleReload = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const onSubmitotp = async (data: { otp: string }) => {
    try {
      setOtpCode(data.otp);
      setLoading(true);

      // Make POST request to verify OTP
      const result = await postData("verificar-codigo-fibrapoints", {
        identificacion: identificacion,
        codigo: data.otp,
      });

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

  async function GetPuntosBloqueados(idContrato: any) {
    try {
      const response = await fetchData("get_fpoints/" + idContrato);
      const puntosBloqueados = response.puntos_disponibles;
      return puntosBloqueados;
    } catch (error) {
      console.error("Error al obtener puntos:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al intentar obtener los puntos.",
        color: "danger",
      });
      return null;
    }
  }

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
      const result = await postData("obtener-codigo-fibrapoints", {
        identificacion: identificacion,
        ip: "200.63.105.162",
      });

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

      const result = await fetchData("get-activeproducts/33");
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
    setSelectedProduct(null);
    setTermsAccepted(false);
    setOtpCode("");
    if (isOpenConfirm) {
      onOpenChangeConfirm();
    }
    if (isOpenSuccess) {
      onOpenChangeSuccess();
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Identification Form Container */}
          <div
            className={`
            relative 
            overflow-hidden 
            flex 
            flex-col 
            items-center 
            border 
            border-default-200 
            dark:border-default-100 
            px-4 
            py-6 
            rounded-lg
            w-full
            ${
              showOtpForm || showSelect || selectedClient
                ? "md:col-start-1"
                : "md:col-start-2"
            }
          `}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">
                <span className="text-black dark:text-white">Bien</span>
                <span style={{ color: "#FE280A" }}>venido</span>
              </h1>
            </div>

            <p className="mb-4 text-center text-sm text-default-600 w-full max-w-[300px] font-bold">
              Ingresa tu número de cédula y consulta tus puntos disponibles
            </p>
            <Form
              className="w-full max-w-[300px] flex flex-col gap-3"
              validationErrors={errors}
              onSubmit={onSubmit}
            >
              <Input
                labelPlacement="outside"
                name="identificacion"
                placeholder="Ingrese 10 o 13 dígitos"
                value={identificacion}
                onChange={handleInputChange}
                type="text"
                maxLength={13}
                isDisabled={consultaRealizada}
                className="w-full"
                variant="bordered"
              />
              <div className="w-full text-center">
                {!consultaRealizada ? (
                  <Button
                    type="submit"
                    variant="solid"
                    isLoading={loading}
                    className="w-full"
                    style={{
                      backgroundColor: "#FE280A",
                      color: "white",
                    }}
                  >
                    Consultar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="flat"
                    color="secondary"
                    className="w-full"
                    onPress={reiniciarProceso}
                  >
                    Realizar otra Consulta
                  </Button>
                )}
              </div>
            </Form>
          </div>

          {/* OTP, Select, and Client Card Container */}
          <div className="md:col-span-2 flex flex-col md:flex-row items-start gap-4 w-full">
            {showOtpForm && (
              <div
                className="
                w-full md:w-1/2
                relative 
                overflow-hidden 
                flex 
                items-center 
                border 
                border-default-200 
                dark:border-default-100 
                px-4 
                py-6 
                rounded-lg
                animate-fade-in
              "
              >
                <div className="w-full">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-default-600">
                      Se ha enviado un código de verificación:
                    </p>
                    <p className="text-xs text-default-500 mt-1">
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
                      color="primary"
                      isLoading={loading}
                    >
                      Verificar Código
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {showSelect && (
              <div className="w-full md:w-1/2 animate-fade-in">
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
                  label="Selecciona tu Contrato"
                  renderValue={(items) =>
                    items.map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span>{item.data?.nombre_cliente ?? "Unknown"}</span>
                          <span className="text-default-500 text-tiny">
                            Dirección: {item.data?.direccion ?? "N/A"}
                          </span>
                        </div>
                      </div>
                    ))
                  }
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

            {selectedClient && (
              <div className="w-full md:w-1/2 max-w-[400px] animate-fade-in">
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
                      <div className="bg-success-100 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-success-600">
                          Puntos Disponibles
                        </p>
                        <p className="text-2xl font-extrabold text-success-800">
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
        </div>

        {/* Client Information Section */}
        {selectedClient && (
          <div className="w-full mt-8 flex flex-col gap-8">
            {/* Transaction History Section */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-4">
                Historial de canjes
              </h2>
              <HistorialTable
                idContrato={selectedClient.contrato}
                reloadTrigger={reloadTrigger}
              />
            </div>
            {/* Products Section */}
            <div>
              <h2 className="text-2xl font-bold text-center mb-4">
                Productos Disponibles
              </h2>
              <p className="text-center text-xs text-default-500 mb-6">
                * Las imágenes presentadas son referenciales y pueden variar del
                producto final.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8">
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
                      <p className="text-default-500">
                        {product.puntos} Puntos
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex justify-end w-full">
              <Button color="danger" variant="flat" onPress={reiniciarProceso}>
                Salir
              </Button>
            </div>
          </div>
        )}

        {/* Product Confirmation Modal */}
        <ConfirmModal
          isOpen={isOpenConfirm}
          onOpenChange={onOpenChangeConfirm}
          selectedProduct={selectedProduct}
          selectedClient={selectedClient}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          handleConfirm={handleConfirm}
        />
        {/* Product Success Modal */}
        <SuccessModal
          isOpen={isOpenSuccess}
          onOpenChange={onOpenChangeSuccess}
          selectedProduct={selectedProduct}
          reiniciarProceso={reiniciarProceso}
        />
      </div>
    </section>
  );
}
