import React, { useState } from 'react';
import { Sparkles, HelpCircle, Check, X, Search, FunctionSquare } from 'lucide-react';

interface FunctionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula: (formulaTemplate: string) => void;
  isDarkMode: boolean;
}

interface FormulaDoc {
  name: string;
  syntax: string;
  category: string;
  description: string;
  example: string;
}

const FORMULA_LIBRARY: FormulaDoc[] = [
  {
    name: 'SUMA (SUM)',
    syntax: '=SUM(rango)',
    category: 'Matemáticas',
    description: 'Suma todos los números de un rango de celdas.',
    example: '=SUM(B2:B10)',
  },
  {
    name: 'PROMEDIO (AVERAGE)',
    syntax: '=AVERAGE(rango)',
    category: 'Estadísticas',
    description: 'Calcula la media aritmética de un rango de valores.',
    example: '=AVERAGE(C2:C15)',
  },
  {
    name: 'SI (IF)',
    syntax: '=IF(condicion, valor_si_verdadero, valor_si_falso)',
    category: 'Lógicas',
    description: 'Evalúa una condición lógica y devuelve un valor si es VERDADERO y otro si es FALSO.',
    example: '=IF(A1>100, "Superado", "Pendiente")',
  },
  {
    name: 'BUSCARV (VLOOKUP)',
    syntax: '=VLOOKUP(valor_buscado, matriz_tabla, indicador_columnas, [ordenado])',
    category: 'Búsqueda',
    description: 'Busca un valor en la primera columna de la izquierda y devuelve el valor en la misma fila de una columna especificada.',
    example: '=VLOOKUP("SKU-101", A2:D50, 3, FALSE)',
  },
  {
    name: 'CONTAR (COUNT)',
    syntax: '=COUNT(rango)',
    category: 'Estadísticas',
    description: 'Cuenta el número de celdas que contienen números en un rango.',
    example: '=COUNT(A1:A50)',
  },
  {
    name: 'MAX',
    syntax: '=MAX(rango)',
    category: 'Estadísticas',
    description: 'Devuelve el valor numérico más grande de un conjunto de valores.',
    example: '=MAX(D2:D100)',
  },
  {
    name: 'MIN',
    syntax: '=MIN(rango)',
    category: 'Estadísticas',
    description: 'Devuelve el valor numérico más pequeño de un conjunto de valores.',
    example: '=MIN(D2:D100)',
  },
  {
    name: 'CONCATENAR (CONCAT)',
    syntax: '=CONCAT(texto1, texto2, ...)',
    category: 'Texto',
    description: 'Une dos o más cadenas de texto en una sola celda.',
    example: '=CONCAT(A2, " ", B2)',
  },
  {
    name: 'HOY (TODAY)',
    syntax: '=TODAY()',
    category: 'Fecha y Hora',
    description: 'Devuelve la fecha actual del sistema formateada.',
    example: '=TODAY()',
  },
  {
    name: 'AHORA (NOW)',
    syntax: '=NOW()',
    category: 'Fecha y Hora',
    description: 'Devuelve la fecha y la hora actual exactas.',
    example: '=NOW()',
  },
  {
    name: 'REDONDEAR (ROUND)',
    syntax: '=ROUND(numero, num_decimales)',
    category: 'Matemáticas',
    description: 'Redondea un número a un número de dígitos especificado.',
    example: '=ROUND(B4*1.21, 2)',
  },
  {
    name: 'SI.ERROR (IFERROR)',
    syntax: '=IFERROR(valor, valor_si_error)',
    category: 'Lógicas',
    description: 'Devuelve un valor que especifica si una fórmula se evalúa como un error; de lo contrario, devuelve el resultado.',
    example: '=IFERROR(A1/B1, 0)',
  },
];

export const FunctionWizardModal: React.FC<FunctionWizardProps> = ({
  isOpen,
  onClose,
  onSelectFormula,
  isDarkMode,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [selectedFunc, setSelectedFunc] = useState<FormulaDoc>(FORMULA_LIBRARY[0]);

  if (!isOpen) return null;

  const categories = ['Todas', 'Matemáticas', 'Estadísticas', 'Lógicas', 'Búsqueda', 'Texto', 'Fecha y Hora'];

  const filtered = FORMULA_LIBRARY.filter((f) => {
    const matchesCat = selectedCat === 'Todas' || f.category === selectedCat;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApply = () => {
    onSelectFormula(selectedFunc.example);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="bg-[#107c41] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunctionSquare className="w-5 h-5" />
            <h3 className="font-bold text-sm">Asistente de Fórmulas y Funciones (fx)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className={`p-4 border-b space-y-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar función (ej: SUMA, BUSCARV, SI)..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-hidden ${
                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
          </div>

          <div className="flex gap-1 overflow-x-auto text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedCat === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* List */}
          <div className={`w-1/2 rounded-lg border overflow-y-auto ${isDarkMode ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
            {filtered.map((item) => (
              <div
                key={item.name}
                onClick={() => setSelectedFunc(item)}
                className={`p-2.5 text-xs cursor-pointer border-b last:border-b-0 transition-colors ${
                  selectedFunc.name === item.name
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 font-semibold text-emerald-900 dark:text-emerald-200'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-[10px] text-zinc-400">{item.category}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className={`w-1/2 p-4 rounded-lg border space-y-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{selectedFunc.name}</h4>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">{selectedFunc.syntax}</p>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {selectedFunc.description}
            </p>
            <div className="p-2.5 rounded bg-zinc-200/50 dark:bg-zinc-900 font-mono text-xs text-emerald-700 dark:text-emerald-300">
              Ejemplo: {selectedFunc.example}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end gap-2 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            Insertar Función
          </button>
        </div>
      </div>
    </div>
  );
};
