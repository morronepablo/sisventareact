// src/pages/compras/AsistenteCompra.jsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const AsistenteCompra = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/compras/bi/asistente-compra");
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Agrupar productos por proveedor
  const proveedoresUnicos = [...new Set(data.map((p) => p.proveedor_nombre))];

  const enviarPedido = async (provNombre) => {
    // Filtramos solo los items de este proveedor que tengan sugerencia > 0
    const items = data.filter(
      (p) => p.proveedor_nombre === provNombre && p.cantidad_sugerida > 0
    );

    if (items.length === 0) {
      return Swal.fire(
        "Atención",
        "No hay sugerencias de compra para enviar.",
        "warning"
      );
    }

    const tel = items[0].proveedor_tel;

    Swal.fire({
      title: "Enviando pedido...",
      text: `Conectando con el Bot para ${provNombre}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await api.post("/compras/bi/enviar-pedido-ws", {
        proveedor_nombre: provNombre,
        proveedor_tel: tel,
        items: items.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad_sugerida,
        })),
      });

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Pedido Enviado!",
          text: `La lista de productos fue entregada correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de envío",
        text:
          error.response?.data?.message ||
          "No se pudo procesar el envío directo.",
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid pt-3">
      <h1>
        <i className="fas fa-robot text-primary mr-2"></i>
        <b>Asistente de Compra BI</b>
      </h1>
      <p className="text-muted">
        Generación automática de pedidos basada en predicción de stock.
      </p>
      <hr />

      {proveedoresUnicos.length === 0 ? (
        <div className="alert alert-success">
          🎉 ¡Todo cubierto! No hay productos que necesiten reposición urgente.
        </div>
      ) : (
        proveedoresUnicos.map((prov) => (
          <div
            className="card card-outline card-primary mb-4 shadow-sm"
            key={prov}
          >
            <div className="card-header">
              <h3 className="card-title text-bold">
                <i className="fas fa-truck mr-2"></i> {prov}
              </h3>
              <div className="card-tools">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => enviarPedido(prov)}
                >
                  <i className="fab fa-whatsapp mr-1"></i> ENVIAR PEDIDO
                  COMPLETO
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-striped m-0">
                <thead>
                  <tr className="text-center">
                    <th className="text-left px-3">Producto</th>
                    <th>Stock Actual</th>
                    <th>Venta Diaria</th>
                    <th className="bg-light">Sugerencia Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((p) => p.proveedor_nombre === prov)
                    .map((prod) => (
                      <tr key={`${prod.proveedor_id}-${prod.id}`}>
                        <td className="px-3 align-middle">{prod.nombre}</td>
                        <td className="text-center align-middle">
                          {prod.stock}
                        </td>
                        <td className="text-center align-middle">
                          {parseFloat(prod.velocidad_diaria).toFixed(2)} / día
                        </td>
                        <td className="text-center align-middle bg-light">
                          <input
                            type="number"
                            className="form-control form-control-sm mx-auto text-center font-weight-bold"
                            style={{
                              width: "80px",
                              border: "1px solid #28a745",
                            }}
                            value={prod.cantidad_sugerida}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setData(
                                data.map((d) =>
                                  d.id === prod.id
                                    ? { ...d, cantidad_sugerida: newValue }
                                    : d
                                )
                              );
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AsistenteCompra;
