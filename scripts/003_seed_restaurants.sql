-- Insert restaurants data
INSERT INTO places (name, type, description, location, price_range, image_url, gallery_images, rating, review_count, contact_phone, contact_email, amenities) VALUES
(
  'Parrilla Don Julio',
  'restaurant',
  'La mejor parrilla de Buenos Aires según los expertos. Carnes de primera calidad, bodega excepcional y ambiente tradicional argentino.',
  'Palermo, Buenos Aires',
  '$$$',
  '/elegant-restaurant-interior.jpg',
  ARRAY['/restaurant-kitchen-chef-cooking.jpg', '/gourmet-food-plating-presentation.jpg'],
  4.9,
  1234,
  '+54 11 4831-9564',
  'reservas@donjulio.com.ar',
  ARRAY['Reservas recomendadas', 'Bodega premium', 'Terraza', 'Menú degustación', 'Sommelier']
),
(
  'Tegui',
  'restaurant',
  'Restaurante de alta cocina con estrella Michelin. Experiencia gastronómica única con menú degustación de autor y maridaje excepcional.',
  'Palermo Hollywood, Buenos Aires',
  '$$$$',
  '/gourmet-food-plating-presentation.jpg',
  ARRAY['/restaurant-kitchen-chef-cooking.jpg', '/elegant-restaurant-interior.jpg'],
  4.8,
  678,
  '+54 11 5291-3333',
  'info@tegui.com.ar',
  ARRAY['Menú degustación', 'Maridaje de vinos', 'Chef de renombre', 'Ambiente íntimo', 'Reserva obligatoria']
),
(
  'La Cabrera',
  'restaurant',
  'Parrilla moderna con porciones generosas y guarniciones ilimitadas. Ambiente animado y perfecto para grupos grandes.',
  'Palermo Viejo, Buenos Aires',
  '$$',
  '/elegant-restaurant-interior.jpg',
  ARRAY['/restaurant-kitchen-chef-cooking.jpg', '/gourmet-food-plating-presentation.jpg'],
  4.7,
  2341,
  '+54 11 4831-7002',
  'contacto@lacabrera.com.ar',
  ARRAY['Sin reserva', 'Guarniciones ilimitadas', 'Bar completo', 'Terraza', 'Grupos grandes']
),
(
  'Proper',
  'restaurant',
  'Cocina de mercado con ingredientes locales y de temporada. Ambiente relajado y carta de vinos naturales.',
  'Recoleta, Buenos Aires',
  '$$$',
  '/gourmet-food-plating-presentation.jpg',
  ARRAY['/restaurant-kitchen-chef-cooking.jpg', '/elegant-restaurant-interior.jpg'],
  4.6,
  456,
  '+54 11 4806-9602',
  'hola@proper.com.ar',
  ARRAY['Ingredientes orgánicos', 'Vinos naturales', 'Menú cambiante', 'Brunch', 'Pet friendly']
);
