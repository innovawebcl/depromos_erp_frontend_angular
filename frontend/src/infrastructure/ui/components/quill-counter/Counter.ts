import Quill from 'quill';

export interface CounterConfig {
  container: string;
  unit: 'word' | 'char';
}

export default class Counter {
  private quill: any;
  private options: CounterConfig;

  constructor(quill: any, options: CounterConfig) {
    this.quill = quill;
    this.options = options;
    const container = document.querySelector(this.options.container);
    quill.on('text-change', () => {
      const length = this.calculate();
      const unitText = (length === 1) ? 'carácter' : 'caracteres';
      if (container) {
        container.textContent = `${length} ${unitText}`;
      }
    });
  }

  private calculate(): number {
    const text = this.quill.getText().trim();
    if (this.options.unit === 'word') {
      return text ? text.split(/\s+/).length : 0;
    }
    return text.length;
  }
}
