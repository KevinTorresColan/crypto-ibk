import './styles.css';

interface HeaderProps {
  handleAlgorithmChange: (algorithm: string) => void;
}

export const Header = ({ handleAlgorithmChange }: HeaderProps) => {
  return (
    <header className="header__container">
      <button onClick={() => handleAlgorithmChange('EC')}>EC</button>
      <button onClick={() => handleAlgorithmChange('OTEC')}>OTEC</button>
      <button onClick={() => handleAlgorithmChange('RSA')}>RSA</button>
    </header>
  );
};
