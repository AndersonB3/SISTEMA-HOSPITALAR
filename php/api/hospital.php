<?php
/**
 * API de Integração com Sistema Flask
 * Sistema Hospitalar - Módulo PHP
 */

require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class HospitalAPI {
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * Buscar estatísticas gerais do sistema
     */
    public function getStatistics(): array {
        try {
            $stats = [];
            
            // Total de pacientes
            $result = $this->db->query("SELECT COUNT(*) as total FROM pacientes");
            $stats['total_pacientes'] = $result[0]['total'] ?? 0;
            
            // Pacientes cadastrados hoje
            $today = date('Y-m-d');
            $result = $this->db->query(
                "SELECT COUNT(*) as total FROM pacientes WHERE DATE(data_cadastro) = ?", 
                [$today]
            );
            $stats['pacientes_hoje'] = $result[0]['total'] ?? 0;
            
            // Pacientes por convênio
            $result = $this->db->query("
                SELECT convenio, COUNT(*) as total 
                FROM pacientes 
                GROUP BY convenio 
                ORDER BY total DESC
            ");
            $stats['pacientes_por_convenio'] = $result;
            
            // Pacientes por faixa etária
            $result = $this->db->query("
                SELECT 
                    CASE 
                        WHEN (julianday('now') - julianday(data_nascimento))/365.25 < 18 THEN 'Menor de 18'
                        WHEN (julianday('now') - julianday(data_nascimento))/365.25 < 65 THEN '18-64 anos'
                        ELSE '65+ anos'
                    END as faixa_etaria,
                    COUNT(*) as total
                FROM pacientes 
                WHERE data_nascimento IS NOT NULL
                GROUP BY faixa_etaria
            ");
            $stats['pacientes_por_idade'] = $result;
            
            return [
                'success' => true,
                'data' => $stats
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Buscar pacientes com filtros avançados
     */
    public function searchPatients(array $filters = []): array {
        try {
            $sql = "SELECT p.*, e.cidade, e.estado FROM pacientes p 
                    LEFT JOIN enderecos e ON p.id = e.paciente_id";
            $params = [];
            $conditions = [];
            
            // Filtro por nome
            if (!empty($filters['nome'])) {
                $conditions[] = "p.nome LIKE ?";
                $params[] = "%" . $filters['nome'] . "%";
            }
            
            // Filtro por convênio
            if (!empty($filters['convenio'])) {
                $conditions[] = "p.convenio = ?";
                $params[] = $filters['convenio'];
            }
            
            // Filtro por cidade
            if (!empty($filters['cidade'])) {
                $conditions[] = "e.cidade LIKE ?";
                $params[] = "%" . $filters['cidade'] . "%";
            }
            
            // Filtro por período de cadastro
            if (!empty($filters['data_inicio'])) {
                $conditions[] = "DATE(p.data_cadastro) >= ?";
                $params[] = $filters['data_inicio'];
            }
            
            if (!empty($filters['data_fim'])) {
                $conditions[] = "DATE(p.data_cadastro) <= ?";
                $params[] = $filters['data_fim'];
            }
            
            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(" AND ", $conditions);
            }
            
            $sql .= " ORDER BY p.data_cadastro DESC";
            
            // Limite e paginação
            $limit = $filters['limit'] ?? 50;
            $offset = $filters['offset'] ?? 0;
            $sql .= " LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $result = $this->db->query($sql, $params);
            
            return [
                'success' => true,
                'data' => $result,
                'total' => count($result)
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Gerar relatório de pacientes
     */
    public function generateReport(string $type = 'summary'): array {
        try {
            switch ($type) {
                case 'summary':
                    return $this->getStatistics();
                    
                case 'detailed':
                    $patients = $this->searchPatients(['limit' => 1000]);
                    if ($patients['success']) {
                        $report = [
                            'total_pacientes' => $patients['total'],
                            'pacientes' => $patients['data'],
                            'gerado_em' => date('Y-m-d H:i:s'),
                            'tipo' => 'Relatório Detalhado de Pacientes'
                        ];
                        
                        return [
                            'success' => true,
                            'data' => $report
                        ];
                    }
                    return $patients;
                    
                default:
                    throw new Exception("Tipo de relatório não suportado");
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

// Processar requisição
try {
    $api = new HospitalAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $endpoint = $_GET['endpoint'] ?? '';
    
    switch ($method) {
        case 'GET':
            switch ($endpoint) {
                case 'statistics':
                    $response = $api->getStatistics();
                    break;
                    
                case 'search':
                    $filters = $_GET;
                    unset($filters['endpoint']);
                    $response = $api->searchPatients($filters);
                    break;
                    
                case 'report':
                    $type = $_GET['type'] ?? 'summary';
                    $response = $api->generateReport($type);
                    break;
                    
                default:
                    $response = [
                        'success' => false,
                        'error' => 'Endpoint não encontrado'
                    ];
                    http_response_code(404);
            }
            break;
            
        default:
            $response = [
                'success' => false,
                'error' => 'Método não permitido'
            ];
            http_response_code(405);
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => 'Erro interno: ' . $e->getMessage()
    ];
    http_response_code(500);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
