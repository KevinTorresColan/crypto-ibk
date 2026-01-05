import React from 'react';
import GetProducts from './components/getProducts/getProducts';
import { Header } from './components/header/header';
import { useGetProducts } from './hooks/useGetProducts';
import { EC } from './modules/ec/ec';
import { OTEC } from './modules/otec/otec';
import { RSA } from './modules/rsa/rsa';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] =
    React.useState<string>('EC');
  const { products, handleProducts } = useGetProducts();

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
  };

  return (
    <>
      <Header handleAlgorithmChange={handleAlgorithmChange} />
      <h2>Lista de productos:</h2>
      <GetProducts products={products} />
      <br />
      {selectedAlgorithm === 'EC' && <EC handleProducts={handleProducts} />}
      {selectedAlgorithm === 'OTEC' && <OTEC handleProducts={handleProducts} />}
      {selectedAlgorithm === 'RSA' && <RSA handleProducts={handleProducts} />}
    </>
  );
}

export default App;
