# React Query-like Hooks Example

Этот проект демонстрирует реализацию пользовательских хуков для управления асинхронными запросами данных (`useQuery`, `useMutation`) в стиле React Query.

## Стек

- React 19
- TypeScript
- Vite

## Структура

- `src/shared/hooks` — хуки `useQuery` и `useMutation`
- `src/shared/api/posts-api.ts` — API-запросы к dummyjson.com
- `src/modules/posts/Posts.tsx` — список постов, создание и удаление
- `src/modules/user/UserProfile.tsx` — профиль пользователя

## Запуск

```sh
npm install
npm run dev