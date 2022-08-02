import { writable } from "svelte/store";

export const idFields = writable({
    "businesses": "id",
    'test': 'testprimaryunique',
    'with_uuid': 'uuid_id',
    'with_manual_string_id': 'string_id_manual',
    'authRoles': 'role',
})