"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
} from "@heroui/react";
import { Button } from "@heroui/button";
import SuccesCard from "../SuccessCard/succesCard";
import { ProductData } from "../Models/ProductData";

interface SuccessModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  selectedProduct: ProductData | null;
  reiniciarProceso: () => void;
}

export default function SuccessModal({
  isOpen,
  onOpenChange,
  selectedProduct,
  reiniciarProceso,
}: SuccessModalProps) {
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
              <div>
                <SuccesCard product={selectedProduct} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Alert
                color="danger"
                title={`No es necesario que realices ninguna acción adicional.`}
              />

              <Button color="danger" variant="flat" onPress={onClose}>
                Atrás
              </Button>
              <Button color="danger" variant="flat" onPress={reiniciarProceso}>
                Salir
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
