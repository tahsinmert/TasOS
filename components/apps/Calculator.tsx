'use client';

import { useState, useEffect, useRef } from 'react';

type Operation = '+' | '-' | '*' | '/' | '%' | null;

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  // Display text'i uzunluğuna göre otomatik boyutlandır
  useEffect(() => {
    if (displayRef.current) {
      const length = display.length;
      if (length > 9) {
        const scale = Math.max(0.4, 1 - (length - 9) * 0.08);
        displayRef.current.style.fontSize = `${scale * 3.5}rem`;
      } else {
        displayRef.current.style.fontSize = '3.5rem';
      }
    }
  }, [display]);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = currentValue * (inputValue / 100);
          break;
        default:
          newValue = inputValue;
      }

      // Sonucu formatla (çok uzun sayıları kısalt)
      const formattedValue = formatNumber(newValue);
      setDisplay(formattedValue);
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const formatNumber = (num: number): string => {
    // Çok büyük veya çok küçük sayıları bilimsel gösterimle göster
    if (Math.abs(num) > 999999999 || (Math.abs(num) < 0.000000001 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // Ondalık kısmı temizle (gereksiz sıfırları kaldır)
    const str = num.toString();
    if (str.includes('.')) {
      return parseFloat(str).toString();
    }
    return str;
  };

  const calculate = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue;
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = currentValue * (inputValue / 100);
          break;
        default:
          newValue = inputValue;
      }

      const formattedValue = formatNumber(newValue);
      setDisplay(formattedValue);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  };

  const Button = ({ 
    label, 
    onClick, 
    className = '', 
    span = false 
  }: { 
    label: string; 
    onClick: () => void; 
    className?: string; 
    span?: boolean;
  }) => {
    const baseClasses = 'w-20 h-20 rounded-full text-2xl font-light transition-all active:scale-95 shadow-sm';
    const colorClasses = className || 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-black';
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${colorClasses} ${span ? 'col-span-2' : ''}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="h-full bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        {/* Display */}
        <div className="bg-black rounded-t-2xl p-6 pb-8">
          <div
            ref={displayRef}
            className="text-white text-right font-light tracking-tight overflow-hidden"
            style={{ fontSize: '3.5rem', lineHeight: '1', minHeight: '4rem' }}
          >
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-black rounded-b-2xl p-4 grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <Button label="AC" onClick={clear} className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black" />
          <Button label="+/-" onClick={toggleSign} className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black" />
          <Button label="%" onClick={() => performOperation('%')} className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black" />
          <Button label="÷" onClick={() => performOperation('/')} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white" />

          {/* Row 2 */}
          <Button label="7" onClick={() => inputNumber('7')} />
          <Button label="8" onClick={() => inputNumber('8')} />
          <Button label="9" onClick={() => inputNumber('9')} />
          <Button label="×" onClick={() => performOperation('*')} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white" />

          {/* Row 3 */}
          <Button label="4" onClick={() => inputNumber('4')} />
          <Button label="5" onClick={() => inputNumber('5')} />
          <Button label="6" onClick={() => inputNumber('6')} />
          <Button label="−" onClick={() => performOperation('-')} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white" />

          {/* Row 4 */}
          <Button label="1" onClick={() => inputNumber('1')} />
          <Button label="2" onClick={() => inputNumber('2')} />
          <Button label="3" onClick={() => inputNumber('3')} />
          <Button label="+" onClick={() => performOperation('+')} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white" />

          {/* Row 5 */}
          <Button label="0" onClick={() => inputNumber('0')} span />
          <Button label="." onClick={inputDecimal} />
          <Button label="=" onClick={calculate} className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white" />
        </div>
      </div>
    </div>
  );
}

