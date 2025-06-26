"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/react";
import { Link } from "@heroui/react";
import { Image } from "@heroui/react";
import { ProductData } from "../Models/ProductData";
import { ClientData } from "../Models/ClientData";

interface ConfirmModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedProduct: ProductData | null;
  selectedClient: ClientData | null;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  handleConfirm: (onClose: () => void) => void;
}

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  selectedProduct,
  selectedClient,
  termsAccepted,
  setTermsAccepted,
  handleConfirm,
}: ConfirmModalProps) {
  return (
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
                    <div className="bg-default-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-default-700">Puntos Requeridos:</p>
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
                        <p className="font-bold text-default-700">Tus Puntos Actuales:</p>
                        <p
                          className={`font-semibold ${
                            (selectedClient?.max_actualpoints ?? 0) <
                            parseInt(selectedProduct?.puntos || "0")
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          {selectedClient ? selectedClient.max_actualpoints : 0} Puntos
                        </p>
                      </div>
                      {selectedClient &&
                        selectedProduct &&
                        selectedClient.max_actualpoints < parseInt(selectedProduct.puntos) && (
                          <div className="mt-2 text-center">
                            <p className="text-danger text-xs">
                              Puntos insuficientes para canjear este producto
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="transition-all duration-200 ease-in-out touch-manipulation active:scale-105 hover:scale-102"
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
  );
}