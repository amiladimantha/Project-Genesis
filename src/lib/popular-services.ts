export interface PopularService {
  name: string
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'yearly' | 'weekly'
  category: string
  icon: string
  color: string
}

export const popularServices: PopularService[] = [
  // Streaming
  { name: 'Netflix', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '🎬', color: '#e50914' },
  { name: 'Spotify', amount: 10.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '🎵', color: '#1db954' },
  { name: 'Disney+', amount: 13.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '🏰', color: '#0063e5' },
  { name: 'HBO Max', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '📺', color: '#5822b4' },
  { name: 'Apple TV+', amount: 9.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '🍎', color: '#000000' },
  { name: 'YouTube Premium', amount: 13.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '▶️', color: '#ff0000' },
  { name: 'Amazon Prime', amount: 14.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '📦', color: '#ff9900' },
  { name: 'Hulu', amount: 17.99, currency: 'USD', billing_cycle: 'monthly', category: 'Entertainment', icon: '📺', color: '#1ce783' },
  
  // Software & Tools
  { name: 'Adobe Creative Cloud', amount: 59.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '🎨', color: '#ff0000' },
  { name: 'Microsoft 365', amount: 12.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '📊', color: '#0078d4' },
  { name: 'Notion', amount: 10.00, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '📝', color: '#000000' },
  { name: 'Figma', amount: 15.00, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '🎨', color: '#f24e1e' },
  { name: '1Password', amount: 4.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '🔐', color: '#0094f5' },
  { name: 'Dropbox', amount: 11.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '📁', color: '#0061ff' },
  { name: 'GitHub Pro', amount: 4.00, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '💻', color: '#333333' },
  { name: 'Slack', amount: 8.75, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '💬', color: '#4a154b' },
  
  // Health & Fitness
  { name: 'Gym Membership', amount: 49.99, currency: 'USD', billing_cycle: 'monthly', category: 'Health', icon: '💪', color: '#ff6b6b' },
  { name: 'Peloton', amount: 44.00, currency: 'USD', billing_cycle: 'monthly', category: 'Health', icon: '🚴', color: '#000000' },
  { name: 'Headspace', amount: 12.99, currency: 'USD', billing_cycle: 'monthly', category: 'Health', icon: '🧘', color: '#ff7e47' },
  { name: 'Calm', amount: 14.99, currency: 'USD', billing_cycle: 'monthly', category: 'Health', icon: '😌', color: '#7ecbff' },
  
  // Gaming
  { name: 'Xbox Game Pass', amount: 16.99, currency: 'USD', billing_cycle: 'monthly', category: 'Gaming', icon: '🎮', color: '#107c10' },
  { name: 'PlayStation Plus', amount: 17.99, currency: 'USD', billing_cycle: 'monthly', category: 'Gaming', icon: '🎮', color: '#003791' },
  { name: 'Nintendo Switch Online', amount: 3.99, currency: 'USD', billing_cycle: 'monthly', category: 'Gaming', icon: '🎮', color: '#e60012' },
  
  // Cloud & Storage
  { name: 'iCloud+', amount: 2.99, currency: 'USD', billing_cycle: 'monthly', category: 'Cloud', icon: '☁️', color: '#3693f3' },
  { name: 'Google One', amount: 2.99, currency: 'USD', billing_cycle: 'monthly', category: 'Cloud', icon: '☁️', color: '#4285f4' },
  
  // News & Reading
  { name: 'Medium', amount: 5.00, currency: 'USD', billing_cycle: 'monthly', category: 'Reading', icon: '📖', color: '#000000' },
  { name: 'The New York Times', amount: 17.00, currency: 'USD', billing_cycle: 'monthly', category: 'Reading', icon: '📰', color: '#000000' },
  { name: 'Audible', amount: 14.95, currency: 'USD', billing_cycle: 'monthly', category: 'Reading', icon: '🎧', color: '#ff9900' },
  { name: 'Kindle Unlimited', amount: 11.99, currency: 'USD', billing_cycle: 'monthly', category: 'Reading', icon: '📚', color: '#ff9900' },
  
  // VPN & Security
  { name: 'NordVPN', amount: 12.99, currency: 'USD', billing_cycle: 'monthly', category: 'Security', icon: '🔒', color: '#4687ff' },
  { name: 'ExpressVPN', amount: 12.95, currency: 'USD', billing_cycle: 'monthly', category: 'Security', icon: '🔒', color: '#da3940' },
  
  // Communication
  { name: 'Zoom Pro', amount: 15.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '📹', color: '#2d8cff' },
  { name: 'Discord Nitro', amount: 9.99, currency: 'USD', billing_cycle: 'monthly', category: 'Software', icon: '💬', color: '#5865f2' },
]

export const serviceCategories = [...new Set(popularServices.map((s) => s.category))]
