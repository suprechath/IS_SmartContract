export interface Project {
  id: number;
  status: 'New' | 'Fully Funded' | 'Almost Funded' | 'Funding Open' | 'Active' | 'Completed';
  title: string;
  location: string;
  description: string;
  raised: number;
  goal: number;
  apy: string;
  minInvestment: number;
  term: string;
  investors: number;
  daysLeft?: number;
  imageUrl: string;
  projectType: 'Solar' | 'Smart Building' | 'Microgrid' | 'Wind Energy' | 'HVAC';
}

export const projects: Project[] = [
  {
    id: 1,
    status: 'New',
    title: 'Downtown Office Tower HVAC Upgrade',
    location: 'New York, USA',
    description: 'Upgrading HVAC systems in a 40-story office building to reduce energy consumption by 25% annually.',
    raised: 250000,
    goal: 330000,
    apy: '7.5% - 9.2%',
    minInvestment: 500,
    term: '5 years',
    investors: 84,
    daysLeft: 12,
    imageUrl: 'https://via.placeholder.com/600x400?text=Commercial+Building',
    projectType: 'HVAC',
  },
  {
    id: 2,
    status: 'Fully Funded',
    title: 'Regional Mall Lighting Retrofit',
    location: 'Singapore',
    description: 'Replacing all lighting fixtures with LED technology across a 200,000 sqft shopping mall.',
    raised: 180000,
    goal: 180000,
    apy: '6.8% - 8.1%',
    minInvestment: 1000,
    term: '7 years',
    investors: 62,
    imageUrl: 'https://via.placeholder.com/600x400?text=Shopping+Mall',
    projectType: 'Smart Building',
  },
  {
    id: 3,
    status: 'Almost Funded',
    title: 'Luxury Hotel Energy Management',
    location: 'Bangkok, Thailand',
    description: 'Implementing smart energy management systems across a 300-room luxury hotel property.',
    raised: 420000,
    goal: 500000,
    apy: '8.2% - 10.5%',
    minInvestment: 250,
    term: '10 years',
    investors: 127,
    daysLeft: 3,
    imageUrl: 'https://via.placeholder.com/600x400?text=Hotel',
    projectType: 'Smart Building',
  },
  {
    id: 4,
    status: 'Funding Open',
    title: 'Sunny Valley Solar Farm',
    location: 'Fresno, CA',
    description: "A 50MW solar farm in California's Central Valley",
    raised: 1872000,
    goal: 2400000,
    apy: '12.5%',
    minInvestment: 1000,
    term: '10 years',
    investors: 120,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Solar'
  },
  {
    id: 5,
    status: 'Fully Funded',
    title: 'Eco Tower - Downtown',
    location: 'Chicago, IL',
    description: 'LEED Platinum certified office building with smart energy systems',
    raised: 5700000,
    goal: 5700000,
    apy: '9.8%',
    minInvestment: 5000,
    term: '15 years',
    investors: 250,
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Smart Building'
  },
  {
    id: 6,
    status: 'Active',
    title: 'Resilient Community Microgrid',
    location: 'Austin, TX',
    description: 'Community-scale microgrid serving 500 homes in rural Texas',
    raised: 1656000,
    goal: 1800000,
    apy: '14.2%',
    minInvestment: 500,
    term: '7 years',
    investors: 300,
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188e1e464588?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Microgrid'
  },
  {
    id: 7,
    status: 'Funding Open',
    title: 'Great Plains Wind Farm',
    location: 'Bismarck, ND',
    description: '20-turbine wind farm in North Dakota with 40MW capacity',
    raised: 1440000,
    goal: 3200000,
    apy: '11.3%',
    minInvestment: 2000,
    term: '12 years',
    investors: 80,
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188e1e464588?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Wind Energy'
  },
  {
    id: 8,
    status: 'Completed',
    title: 'Desert Sun Solar Array',
    location: 'Phoenix, AZ',
    description: '30MW solar array in Arizona delivering returns to investors',
    raised: 2100000,
    goal: 2100000,
    apy: '13.1%',
    minInvestment: 1000,
    term: '8 years',
    investors: 150,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Solar'
  },
  {
    id: 9,
    status: 'Funding Open',
    title: 'Green Heights Apartments',
    location: 'Portland, OR',
    description: 'Net-zero energy residential complex in Portland, OR',
    raised: 1440000,
    goal: 4500000,
    apy: '10.5%',
    minInvestment: 1000,
    term: '10 years',
    investors: 100,
    imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    projectType: 'Smart Building'
  }
];
