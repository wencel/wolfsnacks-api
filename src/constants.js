const localities = [
  '',
  'Usaquén',
  'Chapinero',
  'Santa Fe',
  'San Cristóbal',
  'Usme',
  'Tunjuelito',
  'Bosa',
  'Kennedy',
  'Fontibón',
  'Engativá',
  'Suba',
  'Barrios Unidos',
  'Teusaquillo',
  'Los Mártires',
  'Antonio Nariño',
  'Puente Aranda',
  'La Candelaria',
  'Rafael Uribe Uribe',
  'Ciudad Bolívar',
  'Sumapaz',
];

const presentations = ['', 'Sobre', 'Caja Sello Plus', 'Recarga', 'Bombonera'];

const productTypes = ['', 'Maxigalleta', 'Minigalleta', 'Chips'];

errorMessages = {
  PRICE_INFERIOR_LIMIT: 'El valor del precio debe ser mayor a 0',
  PRICE_INFERIOR_LIMIT_2: 'El valor del precio debe ser mayor o igual a 0',
  QUANTITY_INFERIOR_LIMIT: 'La cantidad debe ser mayor a 0',
  QUANTITY_INFERIOR_LIMIT_2: 'La cantidad debe ser mayor o igual a 0',
  TOTAL_PRICE_INFERIOR_LIMIT: 'El valor total debe ser mayor a 0',
  IVALID_EMAIL: 'El correo electrónico no es válido',
  INVALID_PHONE_NUMBER: 'El número de teléfono no es válido',
  INVALID_EMAIL_PASWORD: 'Correo electrónico o contraseña incorrectos',
  INVALID_EMAIL: 'Ingrese un correo electrónico válido',
  INVALID_PASSWORD:
    'la contraseña debe tener al menos 8 caracteres, una mayuscula, una minuscula y un caracter especial',
  CUSTOMER_NOT_FOUND: 'Cliente no existe',
  ORDER_NOT_FOUND: 'Orden no existe',
  PRODUCT_NOT_FOUND: 'Producto no existe',
  SALE_NOT_FOUND: 'Venta no existe',
  PLEASE_AUTHENTICATE: 'Please authenticate.',
  PRODUCT_DUPLICATE_ERROR:
    'Los campos Nombre, Presentación y Peso deben ser una combinacion única. Ya existe un producto como el que estas tratando de crear.',
};

module.exports = { localities, presentations, productTypes, errorMessages };
