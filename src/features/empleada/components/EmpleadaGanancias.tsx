import { useState, useEffect, useCallback } from "react";
import { withEmpleadaRole } from "@/components/common/ProtectedRoute";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "@/config/env";
import ListPageHeader, { ROLE_THEMES } from "@/components/ui/ListPageHeader";
import ListStatsGrid from "@/components/ui/ListStatsGrid";
import SlideRevealCard from "@/components/ui/SlideRevealCard";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header con degradado */}
      <ListPageHeader
        theme={ROLE_THEMES.empleada}
        title={t("empleada.earnings.title")}
        subtitle={t("empleada.earnings.subtitle")}
        icon={<TrendingUp className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-gray-900"
            >
              {mesOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchGanancias}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Recargar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D95B26]" />
          <p className="text-gray-400 mt-3 text-sm">{t("empleada.earnings.loading")}</p>
        </div>
      ) : data ? (
        <>
          {/* Stats cards */}
          <ListStatsGrid
            columns={4}
            stats={[
              { label: t("empleada.earnings.totalEarned"), value: formatCOP(data.resumen.total_neto), color: '#16a34a', icon: <DollarSign className="w-4 h-4 text-green-600" /> },
              { label: t("empleada.earnings.completedServices"), value: data.resumen.total_servicios, color: '#2563eb', icon: <CheckCircle className="w-4 h-4 text-blue-600" /> },
              { label: t("empleada.earnings.avgPerService"), value: data.resumen.total_servicios > 0 ? formatCOP(data.resumen.total_neto / data.resumen.total_servicios) : '—', color: '#7c3aed', icon: <BarChart2 className="w-4 h-4 text-purple-600" /> },
              { label: t("empleada.earnings.grossTotal"), value: formatCOP(data.resumen.total_bruto), color: '#D95B26', icon: <TrendingUp className="w-4 h-4 text-[#D95B26]" /> },
            ]}
          />

          {/* Detalle del mes */}
          {data.detalle.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t("empleada.earnings.empty")}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D95B26]" />
                  <h2 className="font-semibold text-gray-900 text-sm">
                    {t("admin.createPlan.activities")} — {mesOptions.find(o => o.value === mes)?.label ?? mes}
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {data.detalle.map((row) => (
                  <SlideRevealCard key={row.id_reserva} buttonCount={1} actions={<></>}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #D95B26, #4894AD)" }}>
                        <span className="text-[10px] font-bold leading-none">
                          {row.fecha
                            ? new Date(row.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit" })
                            : "—"}
                        </span>
                        <span className="text-[8px] uppercase leading-none mt-0.5">
                          {row.fecha
                            ? new Date(row.fecha + "T00:00:00").toLocaleDateString("es-CO", { month: "short" })
                            : ""}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {row.fecha
                            ? new Date(row.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t("empleada.earnings.table.gross")}: {formatCOP(row.precio_total)}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-green-600">{formatCOP(row.ganancia)}</span>
                        <p className="text-[10px] text-gray-400">{t("empleada.earnings.table.earnings")}</p>
                      </div>
                    </div>
                  </SlideRevealCard>
                ))}

                {/* Total row */}
                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">Total</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{formatCOP(data.resumen.total_bruto)}</span>
                      <span className="text-sm font-bold text-green-600">{formatCOP(data.resumen.total_neto)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <div>
                        <h2 className="font-semibold text-gray-900 text-sm">CXP — Cuentas por Pagar</h2>
                        <p className="text-xs text-gray-500">Historial de pagos por período</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      {(['mensual', 'quincenal'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPeriodoDisplay(p)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                            periodoDisplay === p
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {cxpRows.map((row) => (
                    <SlideRevealCard key={row.key} buttonCount={1} actions={<></>}>
                      <div className={`flex items-center gap-3 ${row.isCurrent ? 'bg-orange-50/50 -m-3 p-3 sm:-m-4 sm:p-4 rounded-xl' : ''}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          row.pagado ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {row.pagado ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">{row.label}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-500">{row.servicios} servicios</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.pagado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.pagado ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              {row.pagado ? 'Pagado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-green-600">{formatCOP(row.monto)}</span>
                          {row.pagado && (
                            <button className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700">
                              <FileText className="w-3 h-3" />
                              Ver
                            </button>
                          )}
                        </div>
                      </div>
                    </SlideRevealCard>
                  ))}
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
