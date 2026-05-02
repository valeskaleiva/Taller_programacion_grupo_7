import { useMemo, useState } from 'react';

type SaleItem = {
    id: number;
    fecha: string;
    cliente: string;
    vendedor: string;
    metodo_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
    total: number;
};

const TODAY = new Date().toISOString().slice(0, 10);

const initialSales: SaleItem[] = [
    {
        id: 1,
        fecha: TODAY,
        cliente: 'Camila Soto',
        vendedor: 'Valentina',
        metodo_pago: 'Tarjeta',
        total: 28990,
    },
    {
        id: 2,
        fecha: TODAY,
        cliente: 'Diego Rojas',
        vendedor: 'Martina',
        metodo_pago: 'Efectivo',
        total: 15990,
    },
    {
        id: 3,
        fecha: TODAY,
        cliente: 'Nicolás Pérez',
        vendedor: 'Valentina',
        metodo_pago: 'Transferencia',
        total: 44990,
    },
];

function Ventas() {
    const [sales, setSales] = useState<SaleItem[]>(initialSales);
    const [cliente, setCliente] = useState('');
    const [vendedor, setVendedor] = useState('');
    const [metodoPago, setMetodoPago] = useState<SaleItem['metodo_pago']>('Efectivo');
    const [total, setTotal] = useState('');

    const salesToday = useMemo(
        () => sales.filter((sale) => sale.fecha === TODAY),
        [sales]
    );

    const totalHoy = useMemo(
        () => salesToday.reduce((acc, sale) => acc + sale.total, 0),
        [salesToday]
    );

    const ticketPromedio = useMemo(
        () => (salesToday.length > 0 ? Math.round(totalHoy / salesToday.length) : 0),
        [totalHoy, salesToday]
    );

    const handleAddSale = () => {
        if (!cliente.trim() || !vendedor.trim() || !total.trim()) {
            return;
        }

        const parsedTotal = Number(total);
        if (Number.isNaN(parsedTotal) || parsedTotal <= 0) {
            return;
        }

        const newSale: SaleItem = {
            id: Math.max(0, ...sales.map((sale) => sale.id)) + 1,
            fecha: TODAY,
            cliente: cliente.trim(),
            vendedor: vendedor.trim(),
            metodo_pago: metodoPago,
            total: parsedTotal,
        };

        setSales((prev) => [newSale, ...prev]);
        setCliente('');
        setVendedor('');
        setMetodoPago('Efectivo');
        setTotal('');
    };

    return (
        <div className="space-y-6 text-left">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Ventas del día</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">${totalHoy.toLocaleString('es-CL')}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Transacciones hoy</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{salesToday.length}</p>
                </div>
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Ticket promedio</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">${ticketPromedio.toLocaleString('es-CL')}</p>
                </div>
            </section>

            <section className="bg-white border rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Registrar venta diaria</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                    <input
                        className="border rounded-lg px-3 py-2"
                        placeholder="Cliente"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                    />
                    <input
                        className="border rounded-lg px-3 py-2"
                        placeholder="Vendedor"
                        value={vendedor}
                        onChange={(e) => setVendedor(e.target.value)}
                    />
                    <select
                        className="border rounded-lg px-3 py-2"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value as SaleItem['metodo_pago'])}
                    >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                    </select>
                    <input
                        className="border rounded-lg px-3 py-2"
                        placeholder="Total"
                        type="number"
                        min={0}
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAddSale}
                    className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg"
                >
                    Guardar venta
                </button>
            </section>

            <section className="bg-white border rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">Últimas ventas</h2>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left px-3 py-2">Fecha</th>
                                <th className="text-left px-3 py-2">Cliente</th>
                                <th className="text-left px-3 py-2">Vendedor</th>
                                <th className="text-left px-3 py-2">Pago</th>
                                <th className="text-right px-3 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id} className="border-b">
                                    <td className="px-3 py-2">{sale.fecha}</td>
                                    <td className="px-3 py-2">{sale.cliente}</td>
                                    <td className="px-3 py-2">{sale.vendedor}</td>
                                    <td className="px-3 py-2">{sale.metodo_pago}</td>
                                    <td className="px-3 py-2 text-right font-semibold">${sale.total.toLocaleString('es-CL')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default Ventas;