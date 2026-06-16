-- Add relational constraints for usuario/empresa/filial access bindings used by secure tenant context switching.
ALTER TABLE "usuarios_filiais"
  ADD CONSTRAINT "usuarios_filiais_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "usuarios_filiais"
  ADD CONSTRAINT "usuarios_filiais_empresaId_fkey"
  FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "usuarios_filiais"
  ADD CONSTRAINT "usuarios_filiais_filialId_fkey"
  FOREIGN KEY ("filialId") REFERENCES "filiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
