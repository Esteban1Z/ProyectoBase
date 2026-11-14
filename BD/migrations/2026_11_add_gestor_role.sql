USE papeleria_db;

ALTER TABLE usuarios
    MODIFY rol ENUM('admin', 'vendedor', 'gestor') NOT NULL DEFAULT 'vendedor';
