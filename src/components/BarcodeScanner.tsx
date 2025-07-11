import React, { useState, useRef, useEffect } from 'react';
import { Camera, Search, Package, Zap, AlertCircle, CheckCircle, X, Scan, Wifi, WifiOff } from 'lucide-react';
import { BarcodeProduct, NutritionInfo } from '../types';

interface BarcodeScannerProps {
  onProductFound: (product: BarcodeProduct) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onProductFound, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Base de dados expandida de produtos brasileiros
  const productDatabase: Record<string, BarcodeProduct> = {
    '7891000100103': {
      barcode: '7891000100103',
      name: 'Leite Integral Nestlé',
      brand: 'Nestlé',
      nutrition: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.5, fiber: 0, sugar: 4.8, sodium: 50 },
      servingSize: 200,
      servingUnit: 'ml'
    },
    '7891000053508': {
      barcode: '7891000053508',
      name: 'Nescau Achocolatado',
      brand: 'Nestlé',
      nutrition: { calories: 387, protein: 4.1, carbs: 84, fat: 3.7, fiber: 5.1, sugar: 75, sodium: 150 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891000244029': {
      barcode: '7891000244029',
      name: 'Iogurte Natural Nestlé',
      brand: 'Nestlé',
      nutrition: { calories: 51, protein: 4.1, carbs: 4.5, fat: 1.6, fiber: 0, sugar: 4.5, sodium: 46 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891118000104': {
      barcode: '7891118000104',
      name: 'Pão de Forma Integral Wickbold',
      brand: 'Wickbold',
      nutrition: { calories: 253, protein: 9.8, carbs: 43, fat: 4.2, fiber: 6.8, sugar: 3.2, sodium: 420 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891962058917': {
      barcode: '7891962058917',
      name: 'Aveia em Flocos Quaker',
      brand: 'Quaker',
      nutrition: { calories: 394, protein: 13.9, carbs: 66.6, fat: 8.5, fiber: 9.1, sugar: 1.1, sodium: 5 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891000100004': {
      barcode: '7891000100004',
      name: 'Água Mineral Nestlé',
      brand: 'Nestlé',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2 },
      servingSize: 500,
      servingUnit: 'ml'
    },
    '7891991010016': {
      barcode: '7891991010016',
      name: 'Arroz Branco Tio João',
      brand: 'Tio João',
      nutrition: { calories: 358, protein: 7.3, carbs: 78, fat: 0.6, fiber: 1.4, sugar: 0.1, sodium: 1 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891000315507': {
      barcode: '7891000315507',
      name: 'Biscoito Passatempo Recheado',
      brand: 'Nestlé',
      nutrition: { calories: 486, protein: 6.8, carbs: 65, fat: 22, fiber: 2.1, sugar: 28, sodium: 280 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891118000203': {
      barcode: '7891118000203',
      name: 'Peito de Peru Defumado Sadia',
      brand: 'Sadia',
      nutrition: { calories: 103, protein: 18.5, carbs: 1.2, fat: 2.1, fiber: 0, sugar: 0.8, sodium: 1050 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7891000100202': {
      barcode: '7891000100202',
      name: 'Chocolate ao Leite KitKat',
      brand: 'Nestlé',
      nutrition: { calories: 518, protein: 7.3, carbs: 59, fat: 27, fiber: 2.1, sugar: 54, sodium: 32 },
      servingSize: 100,
      servingUnit: 'g'
    },
    // Produtos adicionais para teste
    '1234567890123': {
      barcode: '1234567890123',
      name: 'Produto Teste 1',
      brand: 'Teste',
      nutrition: { calories: 150, protein: 5, carbs: 20, fat: 6, fiber: 2, sugar: 10, sodium: 100 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '9876543210987': {
      barcode: '9876543210987',
      name: 'Produto Teste 2',
      brand: 'Teste',
      nutrition: { calories: 200, protein: 8, carbs: 25, fat: 8, fiber: 3, sugar: 15, sodium: 150 },
      servingSize: 100,
      servingUnit: 'g'
    },
    // Códigos de barras comuns para teste
    '7896000000001': {
      barcode: '7896000000001',
      name: 'Feijão Carioca',
      brand: 'Camil',
      nutrition: { calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4, sugar: 0.3, sodium: 2 },
      servingSize: 100,
      servingUnit: 'g'
    },
    '7896000000002': {
      barcode: '7896000000002',
      name: 'Macarrão Espaguete',
      brand: 'Barilla',
      nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 2.7, sodium: 6 },
      servingSize: 100,
      servingUnit: 'g'
    }
  };

  // Buscar produto online (simulado)
  const searchProductOnline = async (barcode: string): Promise<BarcodeProduct | null> => {
    if (!isOnline) return null;

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular resposta da API baseada no código
      const lastDigit = parseInt(barcode.slice(-1));
      
      if (lastDigit % 3 === 0) {
        return {
          barcode,
          name: `Produto Online ${barcode.slice(-4)}`,
          brand: 'API Brand',
          nutrition: { 
            calories: 120 + (lastDigit * 10), 
            protein: 3 + lastDigit, 
            carbs: 15 + lastDigit, 
            fat: 2 + (lastDigit * 0.5), 
            fiber: 1 + (lastDigit * 0.2), 
            sugar: 5 + lastDigit, 
            sodium: 50 + (lastDigit * 5) 
          },
          servingSize: 100,
          servingUnit: 'g'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro na busca online:', error);
      return null;
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Iniciar simulação de detecção automática
        startAutoDetection();
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões ou use a busca manual.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Simular detecção automática de código de barras
  const startAutoDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      // Simular detecção aleatória (10% de chance a cada 2 segundos)
      if (Math.random() < 0.1 && !searchingProduct) {
        const sampleBarcodes = Object.keys(productDatabase);
        const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
        
        // Mostrar feedback visual de detecção
        setSuccess('Código detectado! Processando...');
        setTimeout(() => {
          searchProduct(randomBarcode);
        }, 1000);
      }
    }, 2000);
  };

  const searchProduct = async (barcode: string) => {
    setSearchingProduct(true);
    setError('');
    setSuccess('');
    
    try {
      // Primeiro, buscar na base local
      let product = productDatabase[barcode];
      
      if (product) {
        setSuccess(`Produto encontrado: ${product.name}`);
        setTimeout(() => {
          onProductFound(product);
          stopCamera();
        }, 1500);
        return;
      }

      // Se não encontrou localmente e está online, buscar na API
      if (isOnline) {
        setSuccess('Buscando online...');
        product = await searchProductOnline(barcode);
        
        if (product) {
          setSuccess(`Produto encontrado online: ${product.name}`);
          setTimeout(() => {
            onProductFound(product);
            stopCamera();
          }, 1500);
          return;
        }
      }

      // Se não encontrou em lugar nenhum, criar produto genérico
      const genericProduct: BarcodeProduct = {
        barcode,
        name: `Produto ${barcode.slice(-6)}`,
        brand: 'Desconhecida',
        nutrition: { calories: 100, protein: 2, carbs: 15, fat: 3, fiber: 1, sugar: 5, sodium: 50 },
        servingSize: 100,
        servingUnit: 'g'
      };
      
      setError('Produto não encontrado. Criando entrada genérica...');
      setTimeout(() => {
        onProductFound(genericProduct);
        stopCamera();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setError('Erro ao buscar produto. Tente novamente.');
    } finally {
      setSearchingProduct(false);
    }
  };

  const handleManualSearch = () => {
    const cleanBarcode = manualBarcode.trim();
    if (cleanBarcode.length >= 8) {
      searchProduct(cleanBarcode);
    } else {
      setError('Digite um código de barras válido (mínimo 8 dígitos)');
    }
  };

  // Simular scan manual
  const simulateBarcodeScan = () => {
    const sampleBarcodes = Object.keys(productDatabase);
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    searchProduct(randomBarcode);
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <Scan className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Scanner de Código</h3>
                <div className="flex items-center mt-1">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área da Câmera */}
          <div className="mb-6">
            {isScanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-gray-900 rounded-xl object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Overlay de Scan com animação melhorada */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-blue-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    
                    {/* Linha de scan animada */}
                    <div className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-lg animate-pulse"
                         style={{
                           top: '50%',
                           animation: 'scan 2s ease-in-out infinite'
                         }}>
                    </div>
                  </div>
                </div>

                {/* Instruções */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-60 rounded-lg px-3 py-2 backdrop-blur-sm">
                    {searchingProduct ? 'Processando...' : 'Posicione o código de barras dentro do quadro'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 font-medium">Scanner de Código de Barras</p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <Camera className="w-4 h-4 mr-2 inline" />
                    Iniciar Scanner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          {isScanning && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={simulateBarcodeScan}
                disabled={searchingProduct}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {searchingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Simular Detecção
                  </>
                )}
              </button>
              
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Parar
              </button>
            </div>
          )}

          {/* Busca Manual */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 font-medium">ou digite manualmente</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de Barras
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setManualBarcode(value);
                    setError('');
                  }}
                  placeholder="Digite o código de barras"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  maxLength={13}
                />
                <button
                  onClick={handleManualSearch}
                  disabled={searchingProduct || manualBarcode.length < 8}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 dígitos • Apenas números
              </p>
            </div>
          </div>

          {/* Mensagens de Status */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {searchingProduct && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              <p className="text-blue-700 text-sm">
                {isOnline ? 'Buscando produto online...' : 'Buscando na base local...'}
              </p>
            </div>
          )}

          {/* Produtos de Exemplo */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Produtos de Exemplo para Teste:</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(productDatabase).slice(0, 4).map((product) => (
                <button
                  key={product.barcode}
                  onClick={() => searchProduct(product.barcode)}
                  disabled={searchingProduct}
                  className="p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 border border-gray-200"
                >
                  <div className="flex items-center">
                    <Package className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.barcode}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dica */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-indigo-500" />
              💡 Como Usar
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• <strong>Scanner:</strong> Aponte a câmera para o código de barras</p>
              <p>• <strong>Manual:</strong> Digite o código diretamente</p>
              <p>• <strong>Teste:</strong> Use "Simular Detecção" ou produtos de exemplo</p>
              <p>• <strong>Online:</strong> Busca automática em base de dados quando conectado</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para animação de scan */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;