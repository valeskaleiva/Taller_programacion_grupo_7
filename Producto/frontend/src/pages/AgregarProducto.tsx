import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
import { useNavigate } from 'react-router-dom';
import { crearProducto } from '../services/api';
import type { Producto } from '../types';

const SCANNER_HINTS = new Map<DecodeHintType, unknown>();
const NOTICE_TIMEOUT_MS = 1000;
const NOTICE_BANNER_CLASS = 'text-sm px-3 py-2 rounded-2xl border border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-sm';
SCANNER_HINTS.set(DecodeHintType.TRY_HARDER, true);
SCANNER_HINTS.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.ITF,
]);

const normalizarCodigoEscaneado = (value: string) => value.replace(/\s+/g, '').trim();

const avisarDeteccion = () => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(120);
  }

  if (typeof window === 'undefined') {
    return;
  }

  const AudioContextClass = window.AudioContext
    || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 1046;
  gainNode.gain.value = 0.08;

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.1);
  oscillator.onended = () => {
    void ctx.close();
  };
};

const productoVacio: Omit<Producto, 'id_producto'> = {
  codigo_barras: '',
  nombre: '',
  descripcion: '',
  stock: 0,
  precio_base: 0,
  categoria: 'Carta',
  rareza: '',
  edicion: '',
  estado: 'Mint',
  precio_mercado: 0,
  cant_cartas: 0,
  serie: '',
  cant_sobres: 0,
};

const AgregarProducto: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<Producto, 'id_producto'>>(productoVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeEscaner, setMensajeEscaner] = useState('');
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [estadoCamara, setEstadoCamara] = useState('');
  const [dispositivos, setDispositivos] = useState<MediaDeviceInfo[]>([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState('');
  const [eligiendoCamara, setEligiendoCamara] = useState(false);
  const [contextoSeguro] = useState(
    () => typeof window !== 'undefined' && window.isSecureContext
  );
  const [camaraDisponible] = useState(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const lectorCamaraRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlesCamaraRef = useRef<IScannerControls | null>(null);
  const ultimoCodigoRef = useRef<{ codigo: string; timestamp: number }>({
    codigo: '',
    timestamp: 0,
  });

  const volverInventario = () => navigate('/inventario');

  const detenerCamara = useCallback(() => {
    controlesCamaraRef.current?.stop();
    controlesCamaraRef.current = null;
    setCamaraActiva(false);
    setMostrarCamara(false);
    setEstadoCamara('');
    setEligiendoCamara(false);
    setDispositivos([]);
    setDispositivoSeleccionado('');
  }, []);

  const iniciarConDispositivo = useCallback(async (deviceId: string) => {
    setEligiendoCamara(false);
    if (!lectorCamaraRef.current) {
      lectorCamaraRef.current = new BrowserMultiFormatReader(SCANNER_HINTS);
    }

    setMostrarCamara(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    if (!videoRef.current) {
      setError('No se pudo inicializar la vista de cámara.');
      setMostrarCamara(false);
      return;
    }

    setEstadoCamara('Iniciando cámara...');

    try {
      const controls = await lectorCamaraRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const codigoDetectado = normalizarCodigoEscaneado(result.getText());
            const ahora = Date.now();
            const esDuplicadoReciente =
              ultimoCodigoRef.current.codigo === codigoDetectado
              && ahora - ultimoCodigoRef.current.timestamp < 1500;

            if (!codigoDetectado || esDuplicadoReciente) {
              return;
            }

            ultimoCodigoRef.current = {
              codigo: codigoDetectado,
              timestamp: ahora,
            };

            avisarDeteccion();
            setEstadoCamara(`Código detectado: ${codigoDetectado}`);

            setForm((prev) => ({ ...prev, codigo_barras: codigoDetectado }));
            setMensajeEscaner('Código detectado. Completa manualmente nombre, stock y precio.');
            return;
          }

          if (err && !(err instanceof NotFoundException)) {
            setEstadoCamara('Cámara activa. Ajusta enfoque o iluminación para escanear.');
          }
        }
      );

      controlesCamaraRef.current = controls;
      setCamaraActiva(true);
      setEstadoCamara('Cámara activa. Apunta al código de barras.');
    } catch {
      setCamaraActiva(false);
      setMostrarCamara(false);
      setEstadoCamara('');
      setError('No se pudo iniciar la cámara. Revisa permisos del navegador.');
    }
  }, []);

  const iniciarCamara = useCallback(async () => {
    setError('');
    setMensajeEscaner('');

    if (!camaraDisponible) {
      setError('Este navegador no tiene acceso a cámara para escanear.');
      return;
    }

    if (!contextoSeguro) {
      setError('Para usar cámara en celular debes abrir el frontend en HTTPS (o localhost).');
      return;
    }

    try {
      const lista = await BrowserMultiFormatReader.listVideoInputDevices();
      if (lista.length === 0) {
        setError('No se detectó ninguna cámara en este equipo.');
        return;
      }

      const preferida = lista.find((d: MediaDeviceInfo) => /rear|back|environment|trase|posterior/.test(d.label.toLowerCase()))
        ?? lista.find((d: MediaDeviceInfo) => /integrated|internal|built|facetime|webcam/.test(d.label.toLowerCase()))
        ?? lista[0];

      if (lista.length === 1) {
        await iniciarConDispositivo(lista[0].deviceId);
        return;
      }

      setDispositivos(lista);
      setDispositivoSeleccionado(preferida.deviceId);
      setMostrarCamara(true);
      setEligiendoCamara(true);
    } catch {
      setError('No se pudo acceder a las cámaras. Revisa permisos del navegador.');
    }
  }, [camaraDisponible, contextoSeguro, iniciarConDispositivo]);

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, [detenerCamara]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!mensajeEscaner) return;
    const timer = window.setTimeout(() => setMensajeEscaner(''), NOTICE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [mensajeEscaner]);

  const guardarProducto = async () => {
    if (!form.codigo_barras.trim() || !form.nombre.trim()) {
      setError('Completa Código de Barras y Nombre.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await crearProducto(form);
      navigate('/inventario');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto.';
      setError(message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4 dashboard-panel-font">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-900 dashboard-panel-font">Agregar producto</h1>
          <p className="text-sm text-green-700">Formulario en pantalla completa para evitar problemas de modal.</p>
        </div>
        <button
          type="button"
          onClick={volverInventario}
          className="px-4 py-2 text-sm border border-green-300 rounded-lg text-green-700 hover:text-green-900 bg-green-50 font-semibold shadow"
        >
          Volver a inventario
        </button>
      </div>

      <div className="bg-green-50 rounded-2xl border border-green-200 shadow-lg p-4 sm:p-6 space-y-4">
        {error && (
          <div className={NOTICE_BANNER_CLASS}>
            {error}
          </div>
        )}

        {mensajeEscaner && (
          <div className={NOTICE_BANNER_CLASS}>
            {mensajeEscaner}
          </div>
        )}

        <div className="text-xs text-gray-600 rounded-lg border border-green-200 bg-white px-3 py-2">
          El código de barras se ingresa con lector tipo teclado (celular como pistola) o manualmente.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Código de Barras *</label>
            <input
              type="text"
              value={form.codigo_barras}
              onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Categoría *</label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value as Producto['categoria'] })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            >
              <option value="Carta">Carta</option>
              <option value="Sobre">Sobre</option>
              <option value="Caja">Caja</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Nombre *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Descripción</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Stock</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-green-900 dashboard-panel-font">Precio Base (CLP)</label>
            <input
              type="number"
              min={0}
              value={form.precio_base}
              onChange={(e) => setForm({ ...form, precio_base: Number(e.target.value) })}
              className="w-full mt-1 border border-green-300 rounded-lg px-3 py-2 text-base bg-green-100 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold shadow"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={volverInventario}
            className="px-4 py-2 text-sm text-green-700 hover:text-green-900 border border-green-300 rounded-lg bg-green-50 font-semibold shadow"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void guardarProducto()}
            disabled={guardando || !form.codigo_barras.trim() || !form.nombre.trim()}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            {guardando ? 'Guardando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProducto;
