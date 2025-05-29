<?php
/**
 * API Ajax Fallback - Galeria Botànica UAB
 * Fitxer de compatibilitat per simular l'AJAX de WordPress
 * 
 * NOTA: Aquest fitxer és només per compatibilitat amb el codi original.
 * L'aplicació actual funciona completament amb JavaScript i no necessita PHP.
 */

// Configuració d'headers per CORS i JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestió de preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Funció per enviar resposta JSON
function enviar_resposta($success = true, $data = null, $message = '') {
    $resposta = [
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('c'),
        'source' => 'galeria-botanica-uab'
    ];
    
    echo json_encode($resposta, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtenir el tipus d'acció sol·licitada
$action = $_REQUEST['action'] ?? '';

// Log de la petició per debugging
error_log("Ajax Fallback - Acció sol·licitada: " . $action);

// Gestió d'accions específiques
switch ($action) {
    
    // Acció per obtenir detalls d'una planta
    case 'galeria_botanica_detalls_planta':
        $planta_id = $_REQUEST['planta_id'] ?? '';
        
        if (empty($planta_id)) {
            enviar_resposta(false, null, 'ID de planta no proporcionat');
        }
        
        // En l'aplicació actual, aquesta funcionalitat es gestiona amb JavaScript
        // Retornem un missatge informatiu
        enviar_resposta(false, null, 'Aquesta funcionalitat es gestiona ara amb JavaScript. Consulta el modal de detalls directament.');
        break;
    
    // Acció per obtenir dades de plantes filtrades
    case 'galeria_botanica_filtrar_plantes':
        $filtres = $_REQUEST['filtres'] ?? [];
        
        // En l'aplicació actual, el filtratge es fa amb JavaScript
        enviar_resposta(false, null, 'El filtratge es gestiona ara completament amb JavaScript per millorar el rendiment.');
        break;
    
    // Acció per obtenir dades del mapa
    case 'mapa_botanica_dades':
        // Les dades del mapa es carreguen directament des de plantes.json
        enviar_resposta(false, null, 'Les dades del mapa es carreguen directament des de dades/plantes.json');
        break;
    
    // Acció per obtenir informació del sistema
    case 'sistema_info':
        $info = [
            'versio' => '2.0',
            'tipus' => 'aplicacio_standalone',
            'php_necessari' => false,
            'base_dades' => 'JSON',
            'imatges' => 'GitHub API',
            'mapa' => 'Leaflet + OpenStreetMap',
            'estat' => 'actiu'
        ];
        
        enviar_resposta(true, $info, 'Aplicació funcionant correctament sense PHP');
        break;
    
    // Acció per verificar l'estat de l'API
    case 'health_check':
        $estat = [
            'servidor' => 'operatiu',
            'timestamp' => date('c'),
            'php_version' => phpversion(),
            'nota' => 'Aquest endpoint és només per compatibilitat. L\'aplicació funciona sense PHP.'
        ];
        
        enviar_resposta(true, $estat, 'API de fallback operativa');
        break;
    
    // Acció per obtenir estadístiques d'ús
    case 'estadistiques':
        // Simulem estadístiques bàsiques
        $stats = [
            'tipus_aplicacio' => 'client_side',
            'tecnologies' => [
                'frontend' => 'HTML5, CSS3, JavaScript ES6+',
                'mapa' => 'Leaflet',
                'dades' => 'JSON',
                'imatges' => 'GitHub API'
            ],
            'navegadors_suportats' => [
                'Chrome' => '80+',
                'Firefox' => '75+',
                'Safari' => '13+',
                'Edge' => '80+'
            ]
        ];
        
        enviar_resposta(true, $stats, 'Estadístiques del sistema');
        break;
    
    // Acció no reconeguda
    default:
        $accions_disponibles = [
            'sistema_info' => 'Informació del sistema',
            'health_check' => 'Verificació de l\'estat',
            'estadistiques' => 'Estadístiques de l\'aplicació'
        ];
        
        enviar_resposta(false, $accions_disponibles, 'Acció no reconeguda. L\'aplicació funciona principalment amb JavaScript.');
        break;
}

// Si arribem aquí, hi ha hagut un error
enviar_resposta(false, null, 'Error inesperat en l\'API de fallback');

/**
 * NOTES IMPORTANTS:
 * 
 * 1. Aquest fitxer és OPCIONAL i només serveix per compatibilitat
 * 2. L'aplicació funciona completament sense PHP
 * 3. Totes les funcionalitats es gestionen amb JavaScript
 * 4. Les dades es carreguen directament des de dades/plantes.json
 * 5. Les imatges es gestionen amb l'API de GitHub
 * 
 * Per executar l'aplicació NO cal servidor PHP, només un navegador web modern.
 */

?>
