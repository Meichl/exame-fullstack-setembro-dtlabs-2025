# IoT Device Monitoring Platform - dtLabs 2025

## Visão Geral do Projeto

Esta é uma plataforma completa de monitoramento de dispositivos IoT desenvolvida para o exame técnico da dtLabs. A aplicação permite o monitoramento em tempo real de dispositivos IoT com funcionalidades de telemetria, alertas automáticos, análise histórica e gerenciamento completo de dispositivos.

### Tecnologias Utilizadas

**Backend:**
- FastAPI (Python 3.11)
- PostgreSQL (Banco de dados)
- SQLAlchemy (ORM)
- JWT Authentication
- WebSockets para tempo real
- Pydantic para validação

**Frontend:**
- React.js 18
- Axios para HTTP requests
- React Router para navegação
- WebSocket para notificações em tempo real

**DevOps:**
- Docker & Docker Compose
- Simuladores de dispositivos IoT
- Makefile para automação

## Pré-requisitos para Instalação

### Windows:
1. **Docker Desktop** - https://www.docker.com/products/docker-desktop
2. **Git** - https://git-scm.com/download/win
3. **Portas disponíveis**: 3000 (Frontend), 8000 (Backend), 5432 (PostgreSQL)

### Verificação de pré-requisitos:
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version

# Verificar portas livres (Windows)
netstat -an | findstr ":3000"
netstat -an | findstr ":8000" 
netstat -an | findstr ":5432"
```

## Instalação Passo a Passo

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/exame-fullstack-setembro-dtlabs-2025.git
cd exame-fullstack-setembro-dtlabs-2025
```

### 2. Estrutura de Arquivos Obrigatória
```
exame-fullstack-setembro-dtlabs-2025/
├── README.md
├── docker-compose.yml
├── Makefile (opcional)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py (pode ficar vazio)
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── auth.py
│   │   └── routes/
│   │       ├── __init__.py (pode ficar vazio)
│   │       ├── auth.py
│   │       ├── devices.py
│   │       ├── heartbeat.py
│   │       └── notifications.py
│   └── tests/
│       ├── __init__.py (pode ficar vazio)
│       ├── test_auth.py
│       └── test_devices.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── components/
│       │   ├── DeviceCard.js
│       │   ├── Navbar.js
│       │   └── PrivateRoute.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Home.js
│       │   ├── DeviceAnalytics.js
│       │   ├── Notifications.js
│       │   └── DeviceManagement.js
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── auth.js
└── heartbeat-simulator/
    ├── Dockerfile
    ├── requirements.txt
    └── simulator.py
```

### 3. Construir e Executar
```bash
# Construir todas as imagens
docker-compose build

# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

### 4. Verificação de Funcionamento

**Backend (API):**
- URL: http://localhost:8000
- Documentação: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

**Frontend:**
- URL: http://localhost:3000

**Verificação rápida:**
```bash
# Testar backend
curl http://localhost:8000/health

# Ver logs
docker-compose logs -f
```

## Guia Completo de Teste para Avaliadores

### Fase 1: Verificação Inicial da Infraestrutura

1. **Verificar containers rodando:**
```bash
docker-compose ps
# Deve mostrar todos os containers UP (backend, frontend, postgres, simulators)
```

2. **Verificar logs sem erros críticos:**
```bash
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
```

3. **Testar conectividade básica:**
```bash
# Backend
curl http://localhost:8000/
# Retorna: {"message": "IoT Device Monitoring API"}

# Documentação da API
# Abrir http://localhost:8000/docs no navegador
```

### Fase 2: Teste da Funcionalidade de Autenticação

1. **Acessar o frontend:**
   - Abrir http://localhost:3000
   - Deve aparecer página de login

2. **Criar conta de usuário:**
   - Clicar em "Sign up"
   - Preencher: Nome, Email, Senha
   - Verificar se redireciona para login

3. **Fazer login:**
   - Inserir credenciais criadas
   - Verificar redirecionamento para dashboard

4. **Teste via API (opcional):**
```bash
# Registrar usuário
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "test123"}'

# Fazer login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### Fase 3: Teste do CRUD de Dispositivos

1. **Adicionar dispositivos (via interface):**
   - Ir para "Manage Devices"
   - Clicar "Add Device"
   - Criar estes dispositivos para coincidir com os simuladores:

**Dispositivo 1:**
```
Nome: Server Room Sensor
Localização: Data Center - Rack A1
Serial Number: SRV001234567
Descrição: Sensor principal do servidor
```

**Dispositivo 2:**
```
Nome: Office Environment Monitor  
Localização: Building B - Floor 3
Serial Number: OFF987654321
Descrição: Monitor do ambiente do escritório
```

**Dispositivo 3:**
```
Nome: IoT Gateway Device
Localização: Warehouse - Section C  
Serial Number: IOT555666777
Descrição: Gateway IoT do armazém
```

2. **Verificar CRUD via API:**
```bash
# Obter token (salvar o access_token)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}' | jq -r '.access_token')

# Listar dispositivos
curl -X GET http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer $TOKEN"

# Criar dispositivo via API
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Device", "location": "Test Lab", "sn": "TEST12345678", "description": "Dispositivo de teste"}'
```

### Fase 4: Verificação dos Simuladores de Telemetria

1. **Verificar simuladores ativos:**
```bash
docker-compose logs simulator-1 | tail -n 10
docker-compose logs simulator-2 | tail -n 10  
docker-compose logs simulator-3 | tail -n 10
```

2. **Verificar envio de heartbeats:**
```bash
# Ver logs do backend para heartbeats recebidos
docker-compose logs backend | grep "POST /api/heartbeat/"
# Deve mostrar status 200 OK, não 404
```

3. **Testar envio manual de heartbeat:**
```bash
curl -X POST http://localhost:8000/api/heartbeat/ \
  -H "Content-Type: application/json" \
  -d '{
    "device_sn": "SRV001234567",
    "cpu_usage": 75.5,
    "ram_usage": 68.2,
    "disk_free": 45.8,
    "temperature": 52.3,
    "dns_latency": 12.4,
    "connectivity": 1,
    "boot_time": "2025-01-19T10:00:00Z"
  }'
```

### Fase 5: Teste das Páginas do Frontend

1. **Dashboard (Home):**
   - Verificar se mostra dispositivos cadastrados
   - Verificar se exibe métricas atuais (CPU, RAM, Temperatura)
   - Verificar status de conectividade

2. **Device Analytics:**
   - Selecionar dispositivos via checkbox
   - Alterar período de análise
   - Verificar se carrega dados históricos em tabelas

3. **Página de Notificações:**
   - Criar notificação de teste:
     - Nome: "High CPU Alert"
     - Métrica: CPU Usage
     - Condição: >
     - Threshold: 60 (valor baixo para teste)
     - Dispositivo: IoT Gateway Device
   - Salvar notificação
   - Aguardar alertas aparecerem automaticamente

4. **Device Management:**
   - Testar edição de dispositivo
   - Testar exclusão de dispositivo
   - Verificar validação de serial number (12 dígitos)

### Fase 6: Teste de Notificações em Tempo Real

1. **Configurar notificação de teste:**
   - Criar alerta para CPU > 50% no dispositivo IOT555666777
   - Este dispositivo tem carga alta e deve gerar alertas

2. **Verificar WebSocket:**
   - Manter página de notificações aberta
   - Verificar se alertas aparecem automaticamente
   - Verificar timestamp dos alertas

3. **Teste via logs:**
```bash
# Verificar WebSocket connections
docker-compose logs backend | grep -i websocket

# Ver notificações sendo criadas
docker-compose logs backend | grep -i notification
```

### Fase 7: Teste de Dados Históricos

1. **Aguardar acumulação de dados (5-10 minutos):**
   - Os simuladores enviam dados a cada minuto
   - Verificar acumulação no banco

2. **Consultar histórico via API:**
```bash
# Obter ID de um dispositivo e consultar histórico
DEVICE_ID="substitua-pelo-id-real"
curl -X GET "http://localhost:8000/api/heartbeat/${DEVICE_ID}/history?start_date=2025-01-19T00:00:00Z&end_date=2025-01-19T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

3. **Verificar na interface:**
   - Ir para Device Analytics
   - Selecionar dispositivo
   - Verificar dados na tabela

### Fase 8: Testes de Validação e Segurança

1. **Testar autenticação:**
```bash
# Tentar acessar rota protegida sem token (deve retornar 401)
curl -X GET http://localhost:8000/api/devices/

# Tentar com token inválido
curl -X GET http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer token_invalido"
```

2. **Testar validação de dados:**
```bash
# Heartbeat inválido (deve retornar 422)
curl -X POST http://localhost:8000/api/heartbeat/ \
  -H "Content-Type: application/json" \
  -d '{"device_sn": "INVALID", "cpu_usage": 150}'
```

### Fase 9: Teste de Performance e Robustez

1. **Múltiplos heartbeats simultâneos:**
```bash
# Ver se o sistema aguenta múltiplos simuladores
docker-compose logs | grep "POST /api/heartbeat/" | wc -l
# Deve mostrar número crescente de heartbeats
```

2. **Verificar uso de recursos:**
```bash
docker stats
```

## Funcionalidades Implementadas (Checklist para Avaliadores)

### Backend (FastAPI)
- [x] Autenticação JWT com senhas hasheadas (bcrypt)
- [x] CRUD completo de usuários
- [x] CRUD completo de dispositivos
- [x] Recepção e validação de telemetria (heartbeats)
- [x] Sistema de notificações com condições personalizáveis
- [x] WebSocket para notificações em tempo real
- [x] Consultas históricas de telemetria
- [x] Tratamento de erros com status codes apropriados
- [x] Validação rigorosa de dados com Pydantic
- [x] Documentação automática Swagger/OpenAPI

### Frontend (React.js)
- [x] Página de login/registro
- [x] Dashboard com resumo dos dispositivos
- [x] Análise histórica com filtros de data
- [x] Sistema de notificações em tempo real
- [x] CRUD de dispositivos com interface intuitiva
- [x] Navegação entre páginas com React Router
- [x] Interface responsiva
- [x] Tratamento de erros e loading states

### Simuladores
- [x] 3 simuladores independentes
- [x] Dados realistas com variações e tendências
- [x] Picos ocasionais de CPU
- [x] Problemas esporádicos de conectividade
- [x] Configuráveis via variáveis de ambiente
- [x] Envio a cada minuto conforme especificado

### DevOps
- [x] Docker Compose funcional
- [x] Todos os serviços containerizados
- [x] Configuração de rede entre containers
- [x] Volumes persistentes para banco de dados
- [x] Health checks para serviços críticos

## Métricas Monitoradas (Conforme Especificação)

Cada dispositivo envia estas métricas exatamente como solicitado:

1. **CPU Usage** - Percentual (0-100%)
2. **RAM Usage** - Percentual (0-100%)
3. **Disk Free Space** - Percentual (0-100%)
4. **Temperature** - Graus Celsius
5. **DNS Latency** - Milissegundos para 8.8.8.8
6. **Connectivity** - 0 (offline) ou 1 (online)
7. **Boot Time** - Timestamp UTC quando dispositivo foi ligado

## Comandos Úteis para Avaliação

### Monitoramento durante avaliação:
```bash
# Logs em tempo real de todos os serviços
docker-compose logs -f

# Status dos containers
docker-compose ps

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f simulator-1

# Reiniciar serviço específico
docker-compose restart backend

# Ver banco de dados
docker-compose exec postgres psql -U user -d iot_monitoring -c "SELECT COUNT(*) FROM heartbeats;"
```

### Limpeza após avaliação:
```bash
# Parar tudo
docker-compose down

# Remover dados (cuidado)
docker-compose down -v

# Remover imagens
docker-compose down --rmi all
```

## Resolução de Problemas Comuns

### Containers não sobem:
```bash
# Verificar portas em uso
netstat -an | findstr :3000

# Limpar Docker
docker system prune -a
docker-compose build --no-cache
```

### Simuladores não enviam dados:
```bash
# Verificar logs
docker-compose logs simulator-1

# Verificar se dispositivos existem no banco
docker-compose exec postgres psql -U user -d iot_monitoring -c "SELECT * FROM devices;"
```

### Frontend não carrega:
```bash
# Aguardar build do Node.js
docker-compose logs frontend

# Reconstruir
docker-compose build frontend
```

## Critérios de Avaliação Atendidos

### ✅ Velocidade de Entrega
- Projeto completo e funcional
- Todas as funcionalidades implementadas
- Documentação detalhada

### ✅ Qualidade dos Testes
- Testes automatizados em backend/tests/
- Casos de teste para autenticação e CRUD
- Instruções detalhadas para teste manual

### ✅ Estrutura da Aplicação  
- Arquitetura limpa e organizada
- Separação clara de responsabilidades
- Padrões de projeto aplicados (Repository, MVC)

### ✅ Coerência com Solicitado
- Todas as páginas especificadas implementadas
- Métricas exatas conforme documento
- Docker Compose funcional
- Simuladores de heartbeat funcionando

### ✅ Tratamento de Erros
- Status codes HTTP apropriados
- Validação rigorosa de dados
- Tratamento de exceções
- Messages de erro informativos

### ✅ Verbos HTTP e Headers Corretos
- GET, POST, PUT, DELETE usados apropriadamente
- Headers de autorização implementados
- Content-Type corretos
- CORS configurado

### ✅ Documentação
- README completo com instruções passo a passo
- Documentação API automática (Swagger)
- Comentários no código
- Guia de troubleshooting

## Contato e Suporte

**Desenvolvido para dtLabs 2025**

Para dúvidas sobre a implementação ou problemas técnicos durante a avaliação, todos os logs e configurações estão disponíveis via Docker Compose.