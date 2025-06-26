import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Skeleton,
  Pagination, // Asegúrate de que este componente esté disponible en @heroui/react
} from "@heroui/react";
import { useState, useEffect } from "react";
import { postData } from "@/services/apiService";

type HistorialItem = {
  id: number;
  nombre_causal: string;
  puntos_canjeados: number;
  status: string;
  estado_ticket: string;
  created_at: string;
};

export default function HistorialTable({ idContrato, reloadTrigger }: { idContrato: any; reloadTrigger: any }) {
  const [historialData, setHistorialData] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Mostrar 3 ítems por página

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const result = await postData("historial-canje-fibrapoints", {
          idContrato: idContrato,
        });

        console.log("Resultado de la API:", result);

        if (result.success) {
          setHistorialData(result.data);
        } else {
          setError(result.message || "Error en la respuesta de la API");
        }
      } catch (err) {
        if (err instanceof Error) {
          if (
            err.message.includes(
              "No se encontraron registros de FibraPoints para el contrato proporcionado."
            ) ||
            (err as any).response?.status === 404
          ) {
            setHistorialData([]);
          } else {
            setError(err.message);
          }
        } else {
          setError("Ocurrió un error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [idContrato, reloadTrigger]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Function to determine the Chip color based on status
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PROCESADO":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "RECHAZADO":
        return "danger";
      default:
        return "default";
    }
  };

  // Skeleton loading state for the table
  const renderSkeletonRows = () => {
    return Array.from({ length: itemsPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="w-full h-4 rounded" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-4 rounded" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-20 h-6 rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-4 rounded" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-4 rounded" />
        </TableCell>
      </TableRow>
    ));
  };

  // Calcular el total de páginas
  const totalPages = Math.ceil(historialData.length / itemsPerPage);

  // Obtener los ítems de la página actual
  const paginatedData = historialData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-4">
      <Table aria-label="Tabla de historial de canje FibraPoints">
        <TableHeader>
          <TableColumn>PRODUCTO</TableColumn>
          <TableColumn>PUNTOS CANJEADOS</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>ESTADO TICKET</TableColumn>
          <TableColumn>FECHA</TableColumn>
        </TableHeader>
        <TableBody>
          {loading ? (
            renderSkeletonRows()
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nombre_causal}</TableCell>
                <TableCell>{item.puntos_canjeados}</TableCell>
                <TableCell>
                  <Chip variant="flat" color={getStatusColor(item.status)}>
                    {item.status}
                  </Chip>
                </TableCell>
                <TableCell>{item.estado_ticket}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: "center" }}>
                No se encontraron registros
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Componente de paginación */}
      {historialData.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            color="primary"
          />
        </div>
      )}
    </div>
  );
}