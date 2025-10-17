-- Insert hotels data
INSERT INTO places (name, type, description, location, price_range, image_url, gallery_images, rating, review_count, contact_phone, contact_email, amenities) VALUES
(
  'Hotel Boutique Palermo',
  'hotel',
  'Elegante hotel boutique en el corazón de Palermo Soho, con diseño contemporáneo y atención personalizada. Perfecto para quienes buscan una experiencia única en Buenos Aires.',
  'Palermo Soho, Buenos Aires',
  '$$$',
  '/boutique-hotel-modern-interior.jpg',
  ARRAY['/hotel-pool-area.jpg', '/hotel-room-interior-luxury.jpg', '/hotel-restaurant-dining.png'],
  4.8,
  342,
  '+54 11 4832-1234',
  'info@boutiquepalermo.com.ar',
  ARRAY['WiFi gratuito', 'Piscina en azotea', 'Spa', 'Restaurante gourmet', 'Bar', 'Gimnasio', 'Servicio de habitaciones 24h']
),
(
  'Eco Lodge Iguazú',
  'hotel',
  'Lodge ecológico rodeado de selva subtropical, a minutos de las Cataratas del Iguazú. Experiencia inmersiva en la naturaleza con todas las comodidades.',
  'Puerto Iguazú, Misiones',
  '$$',
  '/eco-lodge-jungle-nature.jpg',
  ARRAY['/hotel-pool-area.jpg', '/hotel-room-interior-luxury.jpg'],
  4.9,
  567,
  '+54 3757 42-1234',
  'reservas@ecolodgeiguazu.com.ar',
  ARRAY['WiFi', 'Piscina natural', 'Tours guiados', 'Restaurante orgánico', 'Observación de aves', 'Senderos naturales']
),
(
  'Resort Playa Dorada',
  'hotel',
  'Resort de lujo frente al mar con playa privada, múltiples piscinas y actividades acuáticas. Ideal para familias y parejas que buscan relajación total.',
  'Mar del Plata, Buenos Aires',
  '$$$$',
  '/beach-resort-sunset-ocean-view.jpg',
  ARRAY['/hotel-pool-area.jpg', '/hotel-room-interior-luxury.jpg', '/hotel-restaurant-dining.png'],
  4.7,
  891,
  '+54 223 491-1234',
  'contacto@playadorada.com.ar',
  ARRAY['All inclusive', 'Playa privada', '3 Piscinas', 'Spa completo', '4 Restaurantes', 'Kids club', 'Deportes acuáticos']
),
(
  'Posada Colonial Salta',
  'hotel',
  'Encantadora posada colonial en el centro histórico de Salta, con arquitectura tradicional y patios andaluces. Perfecta para explorar el norte argentino.',
  'Centro Histórico, Salta',
  '$$',
  '/colonial-hotel-architecture-colorful.jpg',
  ARRAY['/hotel-pool-area.jpg', '/hotel-room-interior-luxury.jpg'],
  4.6,
  423,
  '+54 387 422-1234',
  'info@posadacolonialsalta.com.ar',
  ARRAY['WiFi gratuito', 'Desayuno incluido', 'Patio colonial', 'Bar', 'Biblioteca', 'Tours organizados']
);
