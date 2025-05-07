const BASE_URL = 'http://localhost:3001';

export async function fetchProjects() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function saveProject(name: string, data: any) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, data }),
  });
  return res.json();
}
