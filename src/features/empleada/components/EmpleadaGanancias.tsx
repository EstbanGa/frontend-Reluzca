import { useState, useEffect, useCallback } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  BarChart2,
  Calendar,
  RefreshCw,
  AlertCircle,
  Clock,
  FileText,
  CreditCard,
} from "lucide-react";

interface DetalleReserva {
  id_reserva: string;
  fecha: string | null;
  precio_total: number;
  ganancia: number;
}

interface MesHistorico {
  mes: string;
  total_servicios: number;
  total_bruto: number;
  total_neto: number;
}

interface Resumen {
  total_servicios: number;
  total_bruto: number;
  total_neto: number;
  porcentaje_empleada: number;
}

interface GananciasData {
  empleada_id: string;
  mes: string;
  resumen: Resumen;
  detalle: DetalleReserva[];
  historico: MesHistorico[];
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function getMesOptions(): { value: string; label: string }[] {
  const hoy = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-CO", { year: "numeric", month: "long" });
    options.push({ value, label });
  }
  return options;
}

function EmpleadaGanancias() {
  const { t } = useTranslation();

  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;

  const [mes, setMes] = useState(mesActual);
  const [periodoDisplay, setPeriodoDisplay] = useState<'mensual' | 'quincenal'>('mensual');
  const [empleadaId, setEmpleadaId] = useState<string | null>(null);
  const [data, setData] = useState<GananciasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  // Obtener ID de la empleada actual
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, { headers: authHeader() })
      .then((r) => r.json())
      .then((user) => setEmpleadaId(user.id ?? user.supabase_uid ?? null))
      .catch(() => setError("No se pudo obtener el usuario actual"));
  }, []);

  const fetchGanancias = useCallback(async () => {
    if (!empleadaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservas/empleada/${empleadaId}/ganancias?mes=${mes}`,
        { headers: authHeader() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: GananciasData = await res.json();
      setData(result);
    } catch {
      setError(t("empleada.earnings.empty"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [empleadaId, mes, t]);

  useEffect(() => {
    if (empleadaId) fetchGanancias();
  }, [fetchGanancias]);

  const mesOptions = getMesOptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-green-600" />
            {t("empleada.earnings.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("empleada.earnings.subtitle")}</p>
        </div>
        <button
          onClick={fetchGanancias}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Calendar className="w-4 h-4" />
          {t("empleada.earnings.period")}
        </label>
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {mesOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-400 mt-3 text-sm">{t("empleada.earnings.loading")}</p>
        </div>
      ) : data ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("empleada.earnings.totalEarned")}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCOP(data.resumen.total_neto)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("empleada.earnings.rate")}: {data.resumen.porcentaje_empleada}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("empleada.earnings.completedServices")}
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.resumen.total_servicios}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t("empleada.earnings.services")}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("empleada.earnings.avgPerService")}
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.resumen.total_servicios > 0
                  ? formatCOP(data.resumen.total_neto / data.resumen.total_servicios)
                  : "—"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("empleada.earnings.grossTotal")}
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCOP(data.resumen.total_bruto)}
              </p>
            </div>
          </div>

          {/* Detail table */}
          {data.detalle.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{t("empleada.earnings.empty")}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t("admin.createPlan.activities")} — {mes}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                        {t("empleada.earnings.table.date")}
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                        {t("empleada.earnings.table.gross")}
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">
                        {t("empleada.earnings.table.earnings")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.detalle.map((row) => (
                      <tr
                        key={row.id_reserva}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.fecha
                            ? new Date(row.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {formatCOP(row.precio_total)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatCOP(row.ganancia)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                        {formatCOP(data.resumen.total_bruto)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {formatCOP(data.resumen.total_neto)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* CXP — Cuentas por Pagar */}
          {data.historico && data.historico.length > 0 && (() => {
            const today = new Date();
            const currentMesStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

            const cxpRows = data.historico.flatMap(h => {
              const isPast = h.mes < currentMesStr;
              const mesLabel = new Date(h.mes + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
              if (periodoDisplay === 'mensual') {
                return [{ key: h.mes, label: mesLabel, servicios: h.total_servicios, monto: h.total_neto, pagado: isPast, isCurrent: h.mes === mes }];
              }
              return [
                { key: `${h.mes}-Q1`, label: `${mesLabel} · 1ª quincena`, servicios: Math.ceil(h.total_servicios / 2), monto: Math.round(h.total_neto / 2), pagado: isPast, isCurrent: h.mes === mes },
                { key: `${h.mes}-Q2`, label: `${mesLabel} · 2ª quincena`, servicios: Math.floor(h.total_servicios / 2), monto: Math.round(h.total_neto / 2), pagado: isPast, isCurrent: h.mes === mes },
              ];
            });

            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      CXP — Cuentas por Pagar
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Historial de pagos por período</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['mensual', 'quincenal'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPeriodoDisplay(p)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                          periodoDisplay === p
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Período</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Servicios</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Monto</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {cxpRows.map((row) => (
                        <tr
                          key={row.key}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                            row.isCurrent ? 'bg-green-50 dark:bg-green-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.label}</td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400 hidden sm:table-cell">{row.servicios}</td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCOP(row.monto)}</td>
                          <td className="px-4 py-3 text-center">
                            {row.pagado ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Pagado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full">
                                <Clock className="w-3 h-3" />
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            {row.pagado ? (
                              <button className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                                Ver
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </>
      ) : null}
    </div>
  );
}

export default withEmpleadaRole(EmpleadaGanancias);
