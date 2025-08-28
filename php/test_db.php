<?php
/**
 * Teste de Conexão com Banco de Dados
 */

echo "<h1>Teste de Conexão PHP + SQLite</h1>";

// Testar caminhos diferentes
$paths = [
    '../instance/hospital.db',
    '../../instance/hospital.db', 
    __DIR__ . '/../instance/hospital.db',
    __DIR__ . '/../../instance/hospital.db',
    'C:/Users/Usuario/Desktop/SISTEMA HOSPITALAR/instance/hospital.db'
];

foreach ($paths as $path) {
    echo "<h3>Testando caminho: $path</h3>";
    
    if (file_exists($path)) {
        echo "✅ Arquivo existe!<br>";
        
        try {
            $pdo = new PDO('sqlite:' . $path);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo "✅ Conexão estabelecida!<br>";
            
            // Testar uma query simples
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM paciente");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "✅ Query executada! Total de pacientes: " . $result['total'] . "<br>";
            
            // Listar tabelas
            $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            echo "📋 Tabelas encontradas: " . implode(', ', $tables) . "<br>";
            
        } catch (Exception $e) {
            echo "❌ Erro: " . $e->getMessage() . "<br>";
        }
    } else {
        echo "❌ Arquivo não encontrado<br>";
    }
    
    echo "<hr>";
}

echo "<h3>Informações do PHP:</h3>";
echo "Versão: " . phpversion() . "<br>";
echo "SQLite suportado: " . (extension_loaded('sqlite3') ? 'Sim' : 'Não') . "<br>";
echo "PDO SQLite suportado: " . (extension_loaded('pdo_sqlite') ? 'Sim' : 'Não') . "<br>";
echo "Diretório atual: " . __DIR__ . "<br>";
echo "Working Directory: " . getcwd() . "<br>";
?>
