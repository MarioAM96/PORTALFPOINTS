import { Card, CardHeader, CardBody, Image, Alert } from "@heroui/react";

export default function SuccessCard({ product }: { product: any }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex flex-col items-center text-center w-full">
        <div className="w-full flex flex-col items-center">
          <Alert
            color="success"
            className="w-full flex flex-row items-center justify-start"
            title={
              <>
                <h1 className="font-bold text-3xl mb-1">¡Felicitaciones!</h1>
                Has canjeado con éxito el producto:{" "}
                <strong>{product.nombre_causal}</strong>.
                <br />
                <small className="text-default-500 mt-2">
                  Un asesor se pondrá en contacto contigo pronto para coordinar
                  la entrega.
                </small>
              </>
            }
          />
        </div>
      </CardHeader>
      <CardBody className="overflow-visible py-2 flex justify-center">
        <div className="flex justify-center">
          <Image
            alt="Imagen del Producto"
            className="object-cover rounded-xl"
            src={
              product.image_url ||
              "https://heroui.com/images/hero-card-complete.jpeg"
            }
            width={270}
          />
        </div>
      </CardBody>
    </Card>
  );
}