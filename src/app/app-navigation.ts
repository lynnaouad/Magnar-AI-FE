export const Navigation = [
  {
    id: 'Providers',
    text: 'Providers',
    path: '/workspaces/:workspaceId/providers',
    icon: 'preferences',
    selected: true,
  },
  {
    id: 'ApiKeys',
    text: 'ApiKeys',
    path: '/workspaces/:workspaceId/api-keys',
    icon: 'key',
    selected: false,
  },
  {
    id: 'Prompts',
    text: 'Prompt',
    path: '/workspaces/:workspaceId/prompt',
    icon: 'description',
    selected: false,
  },

  {
    id: 'Dashboard',
    text: 'Dashboard',
    path: '/workspaces/:workspaceId/dashboard',
    icon: 'datatrending',
    selected: false,
  },
];
