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

export async function deleteProject(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3001/projects/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ошибка при удалении');
  }

  return true;
}
