"use client";

import { useState } from "react";
import type { Usuario, Rol } from "@/types";
import { Card, Field, Input, Select, Button, Table, Th, Td, Badge } from "./ui";
import { uid } from "@/lib/defaults";

interface Props {
  usuarios: Usuario[];
  onSave: (usuarios: Usuario[]) => void;
}

export default function Usuarios({ usuarios, onSave }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ user: "", pass: "", rol: "Operador" as Rol });
  const [err, setErr] = useState("");

  const editing = editId ? usuarios.find((u) => u.id === editId) ?? null : null;

  const startEdit = (u: Usuario) => {
    setEditId(u.id);
    setForm({ user: u.user, pass: "", rol: u.rol });
    setErr("");
  };

  const cancelar = () => {
    setEditId(null);
    setForm({ user: "", pass: "", rol: "Operador" });
    setErr("");
  };

  const guardar = () => {
    const user = form.user.trim();
    if (!user) { setErr("Usuario obligatorio"); return; }
    if (editId) {
      onSave(usuarios.map((u) => u.id === editId ? { ...u, rol: form.rol, pass: form.pass || u.pass } : u));
    } else {
      if (usuarios.find((u) => u.user === user)) { setErr("Ese usuario ya existe"); return; }
      if (!form.pass) { setErr("Contraseña obligatoria"); return; }
      onSave([...usuarios, { id: uid(), user, pass: form.pass, rol: form.rol, activo: true }]);
    }
    cancelar();
  };

  const toggle = (u: Usuario) => {
    if (u.user === "admin") { alert("No se puede desactivar al admin principal"); return; }
    onSave(usuarios.map((x) => x.id === u.id ? { ...x, activo: !x.activo } : x));
  };

  const borrar = (u: Usuario) => {
    if (u.user === "admin") return;
    if (confirm("¿Eliminar este usuario?")) onSave(usuarios.filter((x) => x.id !== u.id));
  };

  return (
    <>
      <Card className="p-5 mb-4">
        <h3 className="text-sm font-medium mb-3">{editing ? "Modificar usuario" : "Nuevo usuario"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
          <Field label="Usuario"><Input type="text" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} disabled={!!editing} /></Field>
          <Field label={`Contraseña${editing ? " (vacío = no cambiar)" : ""}`}><Input type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} /></Field>
          <Field label="Rol">
            <Select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
              <option value="Operador">Operador</option>
              <option value="Administrador">Administrador</option>
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardar}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelar}>Cancelar</Button>}
          </div>
        </div>
        {err && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{err}</div>}
      </Card>

      <Table>
        <thead><tr><Th>Usuario</Th><Th>Rol</Th><Th>Estado</Th><Th align="right">Acciones</Th></tr></thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <Td>{u.user}</Td>
              <Td>{u.rol}</Td>
              <Td>{u.activo ? <Badge color="green">Activo</Badge> : <Badge color="red">Inactivo</Badge>}</Td>
              <Td align="right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" onClick={() => startEdit(u)}>Editar</Button>
                  <Button variant="ghost" onClick={() => toggle(u)}>{u.activo ? "Desactivar" : "Activar"}</Button>
                  {u.user !== "admin" && <Button variant="danger" onClick={() => borrar(u)}>Borrar</Button>}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
