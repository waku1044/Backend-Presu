// Crear un nuevo cliente
export const crearCliente = async (req, res) => {
  try {
    const { nombre, identificacionFiscal, direccion, ciudad, codigoPostal, provincia, pais, telefono, email } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }

    const nuevoCliente = await req.db.cliente.create({
      data: { nombre, identificacionFiscal, direccion, ciudad, codigoPostal, provincia, pais, telefono, email }
    });

    return res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ error: "Error interno al guardar el cliente" });
  }
};

// Obtener todos los clientes (útil para desplegables en el frontend)
export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await req.db.cliente.findMany({
      orderBy: { nombre: 'asc' }
    });
    return res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return res.status(500).json({ error: "Error al listar los clientes" });
  }
};
