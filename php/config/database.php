<?php
/**
 * Configuração de Conexão com Banco de Dados
 * Sistema Hospitalar - Integração PHP
 */

class DatabaseConfig {
    // Configurações para SQLite (mesmo banco do Flask)
    private const DB_PATH = '../../instance/hospital.db';
    
    // Configurações para MySQL/PostgreSQL (futuras)
    private const DB_HOST = 'localhost';
    private const DB_NAME = 'hospital_system';
    private const DB_USER = 'hospital_user';
    private const DB_PASS = 'secure_password';
    
    private static $instance = null;
    private $connection = null;
    
    private function __construct() {
        try {
            // Conectar ao SQLite (mesmo banco do Flask)
            $this->connection = new PDO('sqlite:' . self::DB_PATH);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            throw new Exception("Falha na conexão com o banco de dados");
        }
    }
    
    public static function getInstance(): DatabaseConfig {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection(): PDO {
        return $this->connection;
    }
    
    /**
     * Executa uma query e retorna os resultados
     */
    public function query(string $sql, array $params = []): array {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erro na query: " . $e->getMessage());
            throw new Exception("Erro ao executar consulta");
        }
    }
    
    /**
     * Executa um comando INSERT/UPDATE/DELETE
     */
    public function execute(string $sql, array $params = []): bool {
        try {
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Erro na execução: " . $e->getMessage());
            throw new Exception("Erro ao executar comando");
        }
    }
    
    /**
     * Retorna o último ID inserido
     */
    public function lastInsertId(): string {
        return $this->connection->lastInsertId();
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction(): bool {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     */
    public function commit(): bool {
        return $this->connection->commit();
    }
    
    /**
     * Desfaz uma transação
     */
    public function rollback(): bool {
        return $this->connection->rollback();
    }
}

/**
 * Função auxiliar para obter conexão
 */
function getDB(): DatabaseConfig {
    return DatabaseConfig::getInstance();
}
