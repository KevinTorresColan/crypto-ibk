import { ECModule } from './modules/ec.module.js';
import { OTECModule } from './modules/otec.module.js';
import { RSAModule } from './modules/rsa.module.js';
import { productService } from './services/product.service.js';

class App {
  constructor() {
    this.products = [];
    this.currentAlgorithm = 'EC';
    this.init();
  }

  async init() {
    // Cargar productos iniciales
    await this.loadProducts();

    // Inicializar módulos
    this.ecModule = new ECModule((product) => this.addProduct(product));
    this.otecModule = new OTECModule((product) => this.addProduct(product));
    this.rsaModule = new RSAModule((product) => this.addProduct(product));

    // Setup navigation
    this.setupNavigation();

    // Render productos
    this.renderProducts();
  }

  async loadProducts() {
    try {
      const response = await productService.getProducts();
      this.products = response.data;
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.products = [];
    }
  }

  setupNavigation() {
    const btnEC = document.getElementById('btn-ec');
    const btnOTEC = document.getElementById('btn-otec');
    const btnRSA = document.getElementById('btn-rsa');

    btnEC.addEventListener('click', () => this.switchAlgorithm('EC'));
    btnOTEC.addEventListener('click', () => this.switchAlgorithm('OTEC'));
    btnRSA.addEventListener('click', () => this.switchAlgorithm('RSA'));
  }

  switchAlgorithm(algorithm) {
    this.currentAlgorithm = algorithm;

    // Update active button
    document.querySelectorAll('.header__container button').forEach((btn) => {
      btn.classList.remove('active');
    });

    if (algorithm === 'EC') {
      document.getElementById('btn-ec').classList.add('active');
    } else if (algorithm === 'OTEC') {
      document.getElementById('btn-otec').classList.add('active');
    } else if (algorithm === 'RSA') {
      document.getElementById('btn-rsa').classList.add('active');
    }

    // Show/hide modules
    document.getElementById('module-ec').style.display =
      algorithm === 'EC' ? 'block' : 'none';
    document.getElementById('module-otec').style.display =
      algorithm === 'OTEC' ? 'block' : 'none';
    document.getElementById('module-rsa').style.display =
      algorithm === 'RSA' ? 'block' : 'none';
  }

  addProduct(product) {
    this.products.push(product);
    this.renderProducts();
  }

  renderProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';

    this.products.forEach((product) => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product-item';
      productDiv.innerHTML = `
        <h3>${product.nombre}</h3>
        <p>Stock: ${product.stock || 'N/A'}</p>
      `;
      productsList.appendChild(productDiv);
    });
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
