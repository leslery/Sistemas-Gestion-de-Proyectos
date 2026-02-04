import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  DollarSign,
  Users,
} from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';

interface Factibilidad {
  tecnica: {
    arquitectura: number;
    integracion: number;
    seguridad: number;
    escalabilidad: number;
    observaciones: string;
    viable: boolean | null;
  };
  financiera: {
    costoEstimado: number;
    roi: number;
    payback: number;
    riesgoFinanciero: 'bajo' | 'medio' | 'alto';
    observaciones: string;
    viable: boolean | null;
  };
  operacional: {
    impactoOrganizacional: 'bajo' | 'medio' | 'alto';
    capacitacionRequerida: boolean;
    recursosNecesarios: string;
    observaciones: string;
    viable: boolean | null;
  };
}

export default function InformeFactibilidad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [factibilidad, setFactibilidad] = useState<Factibilidad>({
    tecnica: {
      arquitectura: 0,
      integracion: 0,
      seguridad: 0,
      escalabilidad: 0,
      observaciones: '',
      viable: null,
    },
    financiera: {
      costoEstimado: 0,
      roi: 0,
      payback: 0,
      riesgoFinanciero: 'medio',
      observaciones: '',
      viable: null,
    },
    operacional: {
      impactoOrganizacional: 'medio',
      capacitacionRequerida: false,
      recursosNecesarios: '',
      observaciones: '',
      viable: null,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const renderViabilityButton = (
    value: boolean | null,
    onChange: (val: boolean) => void
  ) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(true)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === true
            ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
        }`}
      >
        <CheckCircle className="h-4 w-4" />
        Viable
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === false
            ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
            : 'bg-gray-100 text-gray-600 hover:bg-red-50'
        }`}
      >
        <XCircle className="h-4 w-4" />
        No Viable
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-accent" />
            Informe de Factibilidad
          </h1>
          <p className="text-gray-500 mt-1">
            Iniciativa: {id ? `INI-${id.padStart(4, '0')}` : 'Nueva'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <Send className="h-4 w-4" />
            Enviar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tecnica">
        <TabList>
          <Tab value="tecnica">
            <Cpu className="h-4 w-4 mr-1.5" />
            Factibilidad Técnica
          </Tab>
          <Tab value="financiera">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Factibilidad Financiera
          </Tab>
          <Tab value="operacional">
            <Users className="h-4 w-4 mr-1.5" />
            Factibilidad Operacional
          </Tab>
        </TabList>

        {/* Técnica */}
        <TabPanel value="tecnica">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquitectura (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={factibilidad.tecnica.arquitectura}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      tecnica: { ...factibilidad.tecnica, arquitectura: Number(e.target.value) },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Complejo</span>
                  <span className="font-medium text-accent">{factibilidad.tecnica.arquitectura}</span>
                  <span>Simple</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Integración (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={factibilidad.tecnica.integracion}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      tecnica: { ...factibilidad.tecnica, integracion: Number(e.target.value) },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Difícil</span>
                  <span className="font-medium text-accent">{factibilidad.tecnica.integracion}</span>
                  <span>Fácil</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seguridad (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={factibilidad.tecnica.seguridad}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      tecnica: { ...factibilidad.tecnica, seguridad: Number(e.target.value) },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Riesgoso</span>
                  <span className="font-medium text-accent">{factibilidad.tecnica.seguridad}</span>
                  <span>Seguro</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalabilidad (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={factibilidad.tecnica.escalabilidad}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      tecnica: { ...factibilidad.tecnica, escalabilidad: Number(e.target.value) },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Limitado</span>
                  <span className="font-medium text-accent">{factibilidad.tecnica.escalabilidad}</span>
                  <span>Escalable</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Técnicas
              </label>
              <textarea
                value={factibilidad.tecnica.observaciones}
                onChange={(e) =>
                  setFactibilidad({
                    ...factibilidad,
                    tecnica: { ...factibilidad.tecnica, observaciones: e.target.value },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                placeholder="Detalle los aspectos técnicos relevantes..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Dictamen Técnico</span>
              {renderViabilityButton(factibilidad.tecnica.viable, (val) =>
                setFactibilidad({
                  ...factibilidad,
                  tecnica: { ...factibilidad.tecnica, viable: val },
                })
              )}
            </div>
          </div>
        </TabPanel>

        {/* Financiera */}
        <TabPanel value="financiera">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Estimado (CLP)
                </label>
                <input
                  type="number"
                  value={factibilidad.financiera.costoEstimado}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      financiera: { ...factibilidad.financiera, costoEstimado: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ROI Esperado (%)
                </label>
                <input
                  type="number"
                  value={factibilidad.financiera.roi}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      financiera: { ...factibilidad.financiera, roi: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payback (meses)
                </label>
                <input
                  type="number"
                  value={factibilidad.financiera.payback}
                  onChange={(e) =>
                    setFactibilidad({
                      ...factibilidad,
                      financiera: { ...factibilidad.financiera, payback: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Riesgo Financiero
              </label>
              <div className="flex items-center gap-3">
                {(['bajo', 'medio', 'alto'] as const).map((nivel) => (
                  <button
                    key={nivel}
                    onClick={() =>
                      setFactibilidad({
                        ...factibilidad,
                        financiera: { ...factibilidad.financiera, riesgoFinanciero: nivel },
                      })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      factibilidad.financiera.riesgoFinanciero === nivel
                        ? nivel === 'bajo'
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                          : nivel === 'medio'
                          ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500'
                          : 'bg-red-100 text-red-700 ring-2 ring-red-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Financieras
              </label>
              <textarea
                value={factibilidad.financiera.observaciones}
                onChange={(e) =>
                  setFactibilidad({
                    ...factibilidad,
                    financiera: { ...factibilidad.financiera, observaciones: e.target.value },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                placeholder="Detalle los aspectos financieros relevantes..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Dictamen Financiero</span>
              {renderViabilityButton(factibilidad.financiera.viable, (val) =>
                setFactibilidad({
                  ...factibilidad,
                  financiera: { ...factibilidad.financiera, viable: val },
                })
              )}
            </div>
          </div>
        </TabPanel>

        {/* Operacional */}
        <TabPanel value="operacional">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impacto Organizacional
                </label>
                <div className="flex items-center gap-3">
                  {(['bajo', 'medio', 'alto'] as const).map((nivel) => (
                    <button
                      key={nivel}
                      onClick={() =>
                        setFactibilidad({
                          ...factibilidad,
                          operacional: { ...factibilidad.operacional, impactoOrganizacional: nivel },
                        })
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        factibilidad.operacional.impactoOrganizacional === nivel
                          ? 'bg-accent/10 text-accent ring-2 ring-accent'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Requiere Capacitación?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFactibilidad({
                        ...factibilidad,
                        operacional: { ...factibilidad.operacional, capacitacionRequerida: true },
                      })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      factibilidad.operacional.capacitacionRequerida
                        ? 'bg-accent/10 text-accent ring-2 ring-accent'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() =>
                      setFactibilidad({
                        ...factibilidad,
                        operacional: { ...factibilidad.operacional, capacitacionRequerida: false },
                      })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !factibilidad.operacional.capacitacionRequerida
                        ? 'bg-accent/10 text-accent ring-2 ring-accent'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recursos Necesarios
              </label>
              <textarea
                value={factibilidad.operacional.recursosNecesarios}
                onChange={(e) =>
                  setFactibilidad({
                    ...factibilidad,
                    operacional: { ...factibilidad.operacional, recursosNecesarios: e.target.value },
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                placeholder="Detalle los recursos humanos y materiales necesarios..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Operacionales
              </label>
              <textarea
                value={factibilidad.operacional.observaciones}
                onChange={(e) =>
                  setFactibilidad({
                    ...factibilidad,
                    operacional: { ...factibilidad.operacional, observaciones: e.target.value },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                placeholder="Detalle los aspectos operacionales relevantes..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Dictamen Operacional</span>
              {renderViabilityButton(factibilidad.operacional.viable, (val) =>
                setFactibilidad({
                  ...factibilidad,
                  operacional: { ...factibilidad.operacional, viable: val },
                })
              )}
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Summary */}
      <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Factibilidad</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              factibilidad.tecnica.viable === true ? 'bg-green-100' :
              factibilidad.tecnica.viable === false ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Cpu className={`h-6 w-6 ${
                factibilidad.tecnica.viable === true ? 'text-green-600' :
                factibilidad.tecnica.viable === false ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-700">Técnica</p>
            <p className="text-xs text-gray-500">
              {factibilidad.tecnica.viable === true ? 'Viable' :
               factibilidad.tecnica.viable === false ? 'No Viable' : 'Pendiente'}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              factibilidad.financiera.viable === true ? 'bg-green-100' :
              factibilidad.financiera.viable === false ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                factibilidad.financiera.viable === true ? 'text-green-600' :
                factibilidad.financiera.viable === false ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-700">Financiera</p>
            <p className="text-xs text-gray-500">
              {factibilidad.financiera.viable === true ? 'Viable' :
               factibilidad.financiera.viable === false ? 'No Viable' : 'Pendiente'}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              factibilidad.operacional.viable === true ? 'bg-green-100' :
              factibilidad.operacional.viable === false ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Users className={`h-6 w-6 ${
                factibilidad.operacional.viable === true ? 'text-green-600' :
                factibilidad.operacional.viable === false ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <p className="text-sm font-medium text-gray-700">Operacional</p>
            <p className="text-xs text-gray-500">
              {factibilidad.operacional.viable === true ? 'Viable' :
               factibilidad.operacional.viable === false ? 'No Viable' : 'Pendiente'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
