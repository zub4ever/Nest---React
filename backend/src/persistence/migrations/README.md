# Migrations

Este projeto usa TypeORM para gerenciar o schema do banco de dados através de migrations.

## Scripts Disponíveis (via Docker - RECOMENDADO)

### Gerar nova migration (a partir das mudanças nas entidades)
```bash
docker compose exec backend npm run migration:generate -- src/persistence/migrations/NomeDaMigration
```

### Criar migration vazia
```bash
docker compose exec backend npm run migration:create src/persistence/migrations/NomeDaMigration
```

### Executar migrations pendentes
```bash
docker compose exec backend npm run migration:run
```

### Reverter a última migration
```bash
docker compose exec backend npm run migration:revert
```

### Apagar todo o schema do banco (cuidado!)
```bash
docker compose exec backend npm run schema:drop
```

## Scripts Alternativos (WSL/Local)

Se estiver usando WSL ou ambiente local:
```bash
wsl docker compose exec backend npm run migration:run
wsl docker compose exec backend npm run migration:generate -- src/persistence/migrations/NomeDaMigration
```

## Configuração

A configuração do TypeORM para migrations está no arquivo:
- `src/persistence/typeorm.config.ts` - Configuração para CLI
- `src/persistence/persistence.module.ts` - Configuração para runtime

## Como usar

1. **Setup inicial**: Execute as migrations existentes
   ```bash
   docker compose exec backend npm run migration:run
   ```

2. **Depois de alterar uma entidade**: Gere uma nova migration
   ```bash
   docker compose exec backend npm run migration:generate -- src/persistence/migrations/AlteracaoNaEntidade
   ```

3. **Execute a nova migration**
   ```bash
   docker compose exec backend npm run migration:run
   ```

## Status Atual

✅ **Sistema configurado e funcionando**
- Migration `CreateUserTable1734339900000` já executada
- Tabela `users` criada com índices
- Nenhuma migration pendente

## Importante

- **NUNCA** altere migrations que já foram executadas em produção
- Sempre teste as migrations em ambiente de desenvolvimento primeiro
- Use nomes descritivos para as migrations
- Sempre implemente os métodos `up` e `down` corretamente