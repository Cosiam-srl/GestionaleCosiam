IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(128) NOT NULL,
    [ProviderKey] nvarchar(128) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(128) NOT NULL,
    [Name] nvarchar(128) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO

CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO

CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO

CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'00000000000000_CreateIdentitySchema', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Mezzi] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NOT NULL,
    [Owned] bit NOT NULL,
    [LicensePlate] nvarchar(50) NOT NULL,
    CONSTRAINT [PK_Mezzi] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Ruoli] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(50) NOT NULL,
    [roleName] nvarchar(50) NOT NULL,
    [Framework] nvarchar(50) NOT NULL,
    [Payment] float NOT NULL,
    [um] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Ruoli] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Personale] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NOT NULL,
    [CF] nvarchar(50) NOT NULL,
    [Surname] nvarchar(17) NULL,
    [telephone] nvarchar(50) NULL,
    [email] nvarchar(50) NULL,
    [birthday] nvarchar(50) NOT NULL,
    [RoleId] int NULL,
    CONSTRAINT [PK_Personale] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Personale_Ruoli_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Ruoli] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_Personale_RoleId] ON [Personale] ([RoleId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210304215706_init', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AlertPersonale] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(50) NOT NULL,
    [expirationDay] nvarchar(50) NOT NULL,
    [Object] nvarchar(50) NOT NULL,
    [PersonId] int NULL,
    CONSTRAINT [PK_AlertPersonale] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AlertPersonale_Personale_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [Personale] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_AlertPersonale_PersonId] ON [AlertPersonale] ([PersonId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210304220232_init1', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [AlertPersonale] DROP CONSTRAINT [FK_AlertPersonale_Personale_PersonId];
GO

ALTER TABLE [Personale] DROP CONSTRAINT [FK_Personale_Ruoli_RoleId];
GO

DROP INDEX [IX_Personale_RoleId] ON [Personale];
GO

DROP INDEX [IX_AlertPersonale_PersonId] ON [AlertPersonale];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'RoleId');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Personale] DROP COLUMN [RoleId];
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AlertPersonale]') AND [c].[name] = N'PersonId');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [AlertPersonale] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [AlertPersonale] DROP COLUMN [PersonId];
GO

ALTER TABLE [Personale] ADD [RuoliId] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [AlertPersonale] ADD [PersonaleId] int NOT NULL DEFAULT 0;
GO

CREATE INDEX [IX_Personale_RuoliId] ON [Personale] ([RuoliId]);
GO

CREATE INDEX [IX_AlertPersonale_PersonaleId] ON [AlertPersonale] ([PersonaleId]);
GO

ALTER TABLE [AlertPersonale] ADD CONSTRAINT [FK_AlertPersonale_Personale_PersonaleId] FOREIGN KEY ([PersonaleId]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [Personale] ADD CONSTRAINT [FK_Personale_Ruoli_RuoliId] FOREIGN KEY ([RuoliId]) REFERENCES [Ruoli] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210305165128_personaleForeignKeyImproved', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Note] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NULL,
    [Description] nvarchar(max) NULL,
    [Date] datetime2 NOT NULL,
    CONSTRAINT [PK_Note] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [TagNota] (
    [Id] int NOT NULL IDENTITY,
    [IdPersonale] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_TagNota] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TagNota_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_TagNota_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_TagNota_IdNote] ON [TagNota] ([IdNote]);
GO

CREATE INDEX [IX_TagNota_IdPersonale] ON [TagNota] ([IdPersonale]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210306080607_NoteAndTagNota', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Cantiere] (
    [Id] int NOT NULL IDENTITY,
    [State] nvarchar(50) NULL,
    [start] datetime2 NOT NULL,
    [EstimatedEnding] datetime2 NOT NULL,
    CONSTRAINT [PK_Cantiere] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [File] (
    [Id] int NOT NULL IDENTITY,
    [URL] nvarchar(2083) NULL,
    [name] nvarchar(50) NULL,
    CONSTRAINT [PK_File] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [ListaNoteDiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdNote] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaNoteDiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaNoteDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaNoteDiCantiere_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ListaPersonaleResponsabileDiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdPersonale] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaPersonaleResponsabileDiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaPersonaleResponsabileDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaPersonaleResponsabileDiCantiere_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AttachmentsCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_AttachmentsCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AttachmentsCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AttachmentsCantiere_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AttachmentsCantiere_IdCantiere] ON [AttachmentsCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_AttachmentsCantiere_IdFile] ON [AttachmentsCantiere] ([IdFile]);
GO

CREATE INDEX [IX_ListaNoteDiCantiere_IdCantiere] ON [ListaNoteDiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaNoteDiCantiere_IdNote] ON [ListaNoteDiCantiere] ([IdNote]);
GO

CREATE INDEX [IX_ListaPersonaleResponsabileDiCantiere_IdCantiere] ON [ListaPersonaleResponsabileDiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaPersonaleResponsabileDiCantiere_IdPersonale] ON [ListaPersonaleResponsabileDiCantiere] ([IdPersonale]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210306083555_CantiereAndNoteControllers', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[Cantiere].[start]', N'Start', N'COLUMN';
GO

ALTER TABLE [Cantiere] ADD [Address] nvarchar(255) NULL;
GO

ALTER TABLE [Cantiere] ADD [IdClienti] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Cantiere] ADD [Name] nvarchar(50) NULL;
GO

CREATE TABLE [Clienti] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(250) NULL,
    CONSTRAINT [PK_Clienti] PRIMARY KEY ([Id])
);
GO

CREATE INDEX [IX_Cantiere_IdClienti] ON [Cantiere] ([IdClienti]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210310160652_CantieriImproved', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD CONSTRAINT [FK_Cantiere_Clienti_IdClienti] FOREIGN KEY ([IdClienti]) REFERENCES [Clienti] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210310161923_CantieriFKClienti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[File]') AND [c].[name] = N'URL');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [File] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [File] DROP COLUMN [URL];
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[File]') AND [c].[name] = N'name');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [File] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [File] DROP COLUMN [name];
GO

ALTER TABLE [File] ADD [FileName] nvarchar(max) NULL;
GO

ALTER TABLE [File] ADD [FolderPath] nvarchar(max) NULL;
GO

ALTER TABLE [File] ADD [Type] nvarchar(max) NULL;
GO

ALTER TABLE [File] ADD [UploadDateTime] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210408092027_FileControllerBase', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[File].[FolderPath]', N'URL', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210408102119_FileControllerBaseUpdate', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP TABLE [AttachmentsCantiere];
GO

CREATE TABLE [AttachmentsNota] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdNota] int NOT NULL,
    CONSTRAINT [PK_AttachmentsNota] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AttachmentsNota_Cantiere_IdNota] FOREIGN KEY ([IdNota]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AttachmentsNota_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AttachmentsNota_IdFile] ON [AttachmentsNota] ([IdFile]);
GO

CREATE INDEX [IX_AttachmentsNota_IdNota] ON [AttachmentsNota] ([IdNota]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210408160222_NotaToFileLinkage', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [AttachmentsNota] DROP CONSTRAINT [FK_AttachmentsNota_Cantiere_IdNota];
GO

ALTER TABLE [AttachmentsNota] ADD CONSTRAINT [FK_AttachmentsNota_Note_IdNota] FOREIGN KEY ([IdNota]) REFERENCES [Note] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210408161111_fixedAttachments', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[Note].[Date]', N'DueDate', N'COLUMN';
GO

ALTER TABLE [Note] ADD [CreationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Note] ADD [Priority] nvarchar(max) NULL;
GO

ALTER TABLE [Note] ADD [State] nvarchar(max) NULL;
GO

CREATE TABLE [TimeCard] (
    [Id] int NOT NULL IDENTITY,
    [NumberOfHours] int NOT NULL,
    [BeginningDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [PersonaleId] int NOT NULL,
    CONSTRAINT [PK_TimeCard] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_TimeCard_Personale_PersonaleId] FOREIGN KEY ([PersonaleId]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_TimeCard_PersonaleId] ON [TimeCard] ([PersonaleId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210412202832_AggiustateTabelleSecondoIndicazioniSal2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [File] ADD [HashCode] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210412204130_FixedFileName', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ListaPersonaleResponsabileDiCantiere] ADD [fromDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [ListaPersonaleResponsabileDiCantiere] ADD [toDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210415142448_addedFromToDateInListaDiPersonaleAssegnatoInCantiereModel', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ListaPersonaleResponsabileDiCantiere] DROP CONSTRAINT [FK_ListaPersonaleResponsabileDiCantiere_Cantiere_IdCantiere];
GO

ALTER TABLE [ListaPersonaleResponsabileDiCantiere] DROP CONSTRAINT [FK_ListaPersonaleResponsabileDiCantiere_Personale_IdPersonale];
GO

DROP TABLE [TagNota];
GO

ALTER TABLE [ListaPersonaleResponsabileDiCantiere] DROP CONSTRAINT [PK_ListaPersonaleResponsabileDiCantiere];
GO

EXEC sp_rename N'[ListaPersonaleResponsabileDiCantiere]', N'ListaPersonaleAssegnatoDiCantiere';
GO

EXEC sp_rename N'[ListaPersonaleAssegnatoDiCantiere].[IX_ListaPersonaleResponsabileDiCantiere_IdPersonale]', N'IX_ListaPersonaleAssegnatoDiCantiere_IdPersonale', N'INDEX';
GO

EXEC sp_rename N'[ListaPersonaleAssegnatoDiCantiere].[IX_ListaPersonaleResponsabileDiCantiere_IdCantiere]', N'IX_ListaPersonaleAssegnatoDiCantiere_IdCantiere', N'INDEX';
GO

ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] ADD CONSTRAINT [PK_ListaPersonaleAssegnatoDiCantiere] PRIMARY KEY ([Id]);
GO

CREATE TABLE [PersonaleResponsabile] (
    [Id] int NOT NULL IDENTITY,
    [IdPersonale] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_PersonaleResponsabile] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PersonaleResponsabile_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PersonaleResponsabile_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_PersonaleResponsabile_IdNote] ON [PersonaleResponsabile] ([IdNote]);
GO

CREATE INDEX [IX_PersonaleResponsabile_IdPersonale] ON [PersonaleResponsabile] ([IdPersonale]);
GO

ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] ADD CONSTRAINT [FK_ListaPersonaleAssegnatoDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] ADD CONSTRAINT [FK_ListaPersonaleAssegnatoDiCantiere_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210415211459_CorrezioneConsistenzaNomiTabelleDB', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [PersonaleResponsabile] DROP CONSTRAINT [FK_PersonaleResponsabile_Note_IdNote];
GO

ALTER TABLE [PersonaleResponsabile] DROP CONSTRAINT [FK_PersonaleResponsabile_Personale_IdPersonale];
GO

ALTER TABLE [PersonaleResponsabile] DROP CONSTRAINT [PK_PersonaleResponsabile];
GO

EXEC sp_rename N'[PersonaleResponsabile]', N'PersonaleResponsabileDiNota';
GO

EXEC sp_rename N'[PersonaleResponsabileDiNota].[IX_PersonaleResponsabile_IdPersonale]', N'IX_PersonaleResponsabileDiNota_IdPersonale', N'INDEX';
GO

EXEC sp_rename N'[PersonaleResponsabileDiNota].[IX_PersonaleResponsabile_IdNote]', N'IX_PersonaleResponsabileDiNota_IdNote', N'INDEX';
GO

ALTER TABLE [PersonaleResponsabileDiNota] ADD CONSTRAINT [PK_PersonaleResponsabileDiNota] PRIMARY KEY ([Id]);
GO

ALTER TABLE [PersonaleResponsabileDiNota] ADD CONSTRAINT [FK_PersonaleResponsabileDiNota_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [PersonaleResponsabileDiNota] ADD CONSTRAINT [FK_PersonaleResponsabileDiNota_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210415211746_CorrezioneConsistenzaNomiTabelleDB2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [Description] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [budget] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [orderCode] nvarchar(max) NOT NULL DEFAULT N'';
GO

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserTokens]') AND [c].[name] = N'Name');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [AspNetUserTokens] ALTER COLUMN [Name] nvarchar(450) NOT NULL;
GO

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserTokens]') AND [c].[name] = N'LoginProvider');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserTokens] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [AspNetUserTokens] ALTER COLUMN [LoginProvider] nvarchar(450) NOT NULL;
GO

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserLogins]') AND [c].[name] = N'ProviderKey');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [AspNetUserLogins] ALTER COLUMN [ProviderKey] nvarchar(450) NOT NULL;
GO

DECLARE @var7 sysname;
SELECT @var7 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AspNetUserLogins]') AND [c].[name] = N'LoginProvider');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [AspNetUserLogins] DROP CONSTRAINT [' + @var7 + '];');
ALTER TABLE [AspNetUserLogins] ALTER COLUMN [LoginProvider] nvarchar(450) NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210429093919_AggiustatoModelloCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [cig] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [cup] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [oda] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210429094129_AggiustatoModelloCantiere2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] ADD [CantiereId] int NULL;
GO

CREATE TABLE [ListaCapiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdPersonale] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaCapiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaCapiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaCapiCantiere_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ListaProjectManagerCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdPersonale] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaProjectManagerCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaProjectManagerCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaProjectManagerCantiere_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Personale_CantiereId] ON [Personale] ([CantiereId]);
GO

CREATE INDEX [IX_ListaCapiCantiere_IdCantiere] ON [ListaCapiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaCapiCantiere_IdPersonale] ON [ListaCapiCantiere] ([IdPersonale]);
GO

CREATE INDEX [IX_ListaProjectManagerCantiere_IdCantiere] ON [ListaProjectManagerCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaProjectManagerCantiere_IdPersonale] ON [ListaProjectManagerCantiere] ([IdPersonale]);
GO

ALTER TABLE [Personale] ADD CONSTRAINT [FK_Personale_Cantiere_CantiereId] FOREIGN KEY ([CantiereId]) REFERENCES [Cantiere] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210429095253_prova', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] DROP CONSTRAINT [FK_Personale_Cantiere_CantiereId];
GO

DROP INDEX [IX_Personale_CantiereId] ON [Personale];
GO

DECLARE @var8 sysname;
SELECT @var8 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'CantiereId');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var8 + '];');
ALTER TABLE [Personale] DROP COLUMN [CantiereId];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210429095829_ElimntPrcedente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var9 sysname;
SELECT @var9 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'Name');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var9 + '];');
ALTER TABLE [Cantiere] DROP COLUMN [Name];
GO

ALTER TABLE [Cantiere] ADD [IdLogo] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210430124940_ProaAggiuntaIdLogoCantiereSenzaPassarePerLaFKSuFile', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE INDEX [IX_Cantiere_IdLogo] ON [Cantiere] ([IdLogo]);
GO

ALTER TABLE [Cantiere] ADD CONSTRAINT [FK_Cantiere_File_IdLogo] FOREIGN KEY ([IdLogo]) REFERENCES [File] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210430125028_aggiuntFKdaIDLogoCantiereAidTabellaFile', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] DROP CONSTRAINT [FK_Cantiere_File_IdLogo];
GO

DECLARE @var10 sysname;
SELECT @var10 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'IdLogo');
IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var10 + '];');
ALTER TABLE [Cantiere] ALTER COLUMN [IdLogo] int NULL;
GO

ALTER TABLE [Cantiere] ADD CONSTRAINT [FK_Cantiere_File_IdLogo] FOREIGN KEY ([IdLogo]) REFERENCES [File] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210430130326_aggiuntFKdaIDLogoCantiereAidTabellaFileProvaNullableFile', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var11 sysname;
SELECT @var11 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'Owned');
IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var11 + '];');
ALTER TABLE [Mezzi] DROP COLUMN [Owned];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210501144002_mezzi2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ListaFileDiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaFileDiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaFileDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaFileDiCantiere_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ListaFileDiCantiere_IdCantiere] ON [ListaFileDiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaFileDiCantiere_IdFile] ON [ListaFileDiCantiere] ([IdFile]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210503125735_AggiuntaTabellaFileSuCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ListaMezziDiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdMezzi] int NOT NULL,
    [IdCantiere] int NOT NULL,
    [fromDate] datetime2 NOT NULL,
    [toDate] datetime2 NOT NULL,
    CONSTRAINT [PK_ListaMezziDiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaMezziDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaMezziDiCantiere_Mezzi_IdMezzi] FOREIGN KEY ([IdMezzi]) REFERENCES [Mezzi] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ListaMezziDiCantiere_IdCantiere] ON [ListaMezziDiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaMezziDiCantiere_IdMezzi] ON [ListaMezziDiCantiere] ([IdMezzi]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210510131837_AggiuntaListaMezziDiCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Fornitori] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(250) NULL,
    [Email] nvarchar(max) NULL,
    [PIVA] nvarchar(max) NULL,
    [Location] nvarchar(max) NULL,
    [Type] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    CONSTRAINT [PK_Fornitori] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210510142030_AggiuntiFornitoriModel', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ListaFornitoriCantiere] (
    [Id] int NOT NULL IDENTITY,
    [IdFornitore] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ListaFornitoriCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaFornitoriCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaFornitoriCantiere_Fornitori_IdFornitore] FOREIGN KEY ([IdFornitore]) REFERENCES [Fornitori] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ListaFornitoriCantiere_IdCantiere] ON [ListaFornitoriCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ListaFornitoriCantiere_IdFornitore] ON [ListaFornitoriCantiere] ([IdFornitore]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210510144249_MiglioratoModelloFornitoriECollagatoACantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP TABLE [AlertPersonale];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210511210904_eliminatoVecchioModelloAlertPersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [MezziNota] (
    [Id] int NOT NULL IDENTITY,
    [IdMezzo] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_MezziNota] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_MezziNota_Mezzi_IdMezzo] FOREIGN KEY ([IdMezzo]) REFERENCES [Mezzi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_MezziNota_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_MezziNota_IdMezzo] ON [MezziNota] ([IdMezzo]);
GO

CREATE INDEX [IX_MezziNota_IdNote] ON [MezziNota] ([IdNote]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210511211405_aggiuntoCollegamentoMezziNote', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var12 sysname;
SELECT @var12 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Note]') AND [c].[name] = N'State');
IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [Note] DROP CONSTRAINT [' + @var12 + '];');
UPDATE [Note] SET [State] = N'' WHERE [State] IS NULL;
ALTER TABLE [Note] ALTER COLUMN [State] nvarchar(max) NOT NULL;
ALTER TABLE [Note] ADD DEFAULT N'' FOR [State];
GO

DECLARE @var13 sysname;
SELECT @var13 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Note]') AND [c].[name] = N'Priority');
IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [Note] DROP CONSTRAINT [' + @var13 + '];');
UPDATE [Note] SET [Priority] = N'' WHERE [Priority] IS NULL;
ALTER TABLE [Note] ALTER COLUMN [Priority] nvarchar(max) NOT NULL;
ALTER TABLE [Note] ADD DEFAULT N'' FOR [Priority];
GO

DECLARE @var14 sysname;
SELECT @var14 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Note]') AND [c].[name] = N'Name');
IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [Note] DROP CONSTRAINT [' + @var14 + '];');
UPDATE [Note] SET [Name] = N'' WHERE [Name] IS NULL;
ALTER TABLE [Note] ALTER COLUMN [Name] nvarchar(50) NOT NULL;
ALTER TABLE [Note] ADD DEFAULT N'' FOR [Name];
GO

DECLARE @var15 sysname;
SELECT @var15 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Note]') AND [c].[name] = N'DueDate');
IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [Note] DROP CONSTRAINT [' + @var15 + '];');
ALTER TABLE [Note] ALTER COLUMN [DueDate] datetime2 NULL;
GO

DECLARE @var16 sysname;
SELECT @var16 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Note]') AND [c].[name] = N'Description');
IF @var16 IS NOT NULL EXEC(N'ALTER TABLE [Note] DROP CONSTRAINT [' + @var16 + '];');
UPDATE [Note] SET [Description] = N'' WHERE [Description] IS NULL;
ALTER TABLE [Note] ALTER COLUMN [Description] nvarchar(max) NOT NULL;
ALTER TABLE [Note] ADD DEFAULT N'' FOR [Description];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210515093937_AggiuntoNullableSuDueDateNote', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] DROP CONSTRAINT [FK_Personale_Ruoli_RuoliId];
GO

DROP TABLE [Ruoli];
GO

DROP INDEX [IX_Personale_RuoliId] ON [Personale];
GO

DECLARE @var17 sysname;
SELECT @var17 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'RuoliId');
IF @var17 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var17 + '];');
ALTER TABLE [Personale] DROP COLUMN [RuoliId];
GO

ALTER TABLE [Personale] ADD [Address] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [BirthPlace] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [ConsegnaDPI] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Personale] ADD [ConsegnaTesserino] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Personale] ADD [Employed] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Personale] ADD [HiringEndDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Personale] ADD [HiringStartDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Personale] ADD [OrganizationRole] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [Title] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [contract] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [job] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Personale] ADD [medicalIdoneity] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210526150110_newPersonalModel', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var18 sysname;
SELECT @var18 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'medicalIdoneity');
IF @var18 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var18 + '];');
ALTER TABLE [Personale] ALTER COLUMN [medicalIdoneity] nvarchar(max) NULL;
GO

DECLARE @var19 sysname;
SELECT @var19 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'job');
IF @var19 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var19 + '];');
ALTER TABLE [Personale] ALTER COLUMN [job] nvarchar(max) NULL;
GO

DECLARE @var20 sysname;
SELECT @var20 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'contract');
IF @var20 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var20 + '];');
ALTER TABLE [Personale] ALTER COLUMN [contract] nvarchar(max) NULL;
GO

DECLARE @var21 sysname;
SELECT @var21 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'Title');
IF @var21 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var21 + '];');
ALTER TABLE [Personale] ALTER COLUMN [Title] nvarchar(max) NULL;
GO

DECLARE @var22 sysname;
SELECT @var22 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'OrganizationRole');
IF @var22 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var22 + '];');
ALTER TABLE [Personale] ALTER COLUMN [OrganizationRole] nvarchar(max) NULL;
GO

DECLARE @var23 sysname;
SELECT @var23 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'HiringStartDate');
IF @var23 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var23 + '];');
ALTER TABLE [Personale] ALTER COLUMN [HiringStartDate] datetime2 NULL;
GO

DECLARE @var24 sysname;
SELECT @var24 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'HiringEndDate');
IF @var24 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var24 + '];');
ALTER TABLE [Personale] ALTER COLUMN [HiringEndDate] datetime2 NULL;
GO

DECLARE @var25 sysname;
SELECT @var25 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'Employed');
IF @var25 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var25 + '];');
ALTER TABLE [Personale] ALTER COLUMN [Employed] bit NULL;
GO

DECLARE @var26 sysname;
SELECT @var26 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'ConsegnaTesserino');
IF @var26 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var26 + '];');
ALTER TABLE [Personale] ALTER COLUMN [ConsegnaTesserino] bit NULL;
GO

DECLARE @var27 sysname;
SELECT @var27 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'ConsegnaDPI');
IF @var27 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var27 + '];');
ALTER TABLE [Personale] ALTER COLUMN [ConsegnaDPI] bit NULL;
GO

DECLARE @var28 sysname;
SELECT @var28 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'BirthPlace');
IF @var28 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var28 + '];');
ALTER TABLE [Personale] ALTER COLUMN [BirthPlace] nvarchar(max) NULL;
GO

DECLARE @var29 sysname;
SELECT @var29 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'Address');
IF @var29 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var29 + '];');
ALTER TABLE [Personale] ALTER COLUMN [Address] nvarchar(max) NULL;
GO

ALTER TABLE [Personale] ADD [level] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210526150655_newPersonalModelpt2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[Fornitori].[Location]', N'Telephone', N'COLUMN';
GO

DECLARE @var30 sysname;
SELECT @var30 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'Surname');
IF @var30 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var30 + '];');
UPDATE [Personale] SET [Surname] = N'' WHERE [Surname] IS NULL;
ALTER TABLE [Personale] ALTER COLUMN [Surname] nvarchar(17) NOT NULL;
ALTER TABLE [Personale] ADD DEFAULT N'' FOR [Surname];
GO

ALTER TABLE [Fornitori] ADD [Address] nvarchar(max) NULL;
GO

ALTER TABLE [Fornitori] ADD [CAP] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Address] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [CAP] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Email] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [PIVA] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Status] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Telephone] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Type] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210527080911_fornitori+clientimodels', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[Mezzi].[Name]', N'Descrizione', N'COLUMN';
GO

DECLARE @var31 sysname;
SELECT @var31 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'LicensePlate');
IF @var31 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var31 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [LicensePlate] nvarchar(max) NOT NULL;
GO

ALTER TABLE [Mezzi] ADD [ContoProprioContoTerzi] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [Costruttore] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Mezzi] ADD [ExtimatedValue] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Mezzi] ADD [FurtoIncendio] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [ISPSEL] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [InsuranceExpirationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [LastKMCheck] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Mezzi] ADD [LicenseCProprio] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [MatriculationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [Model] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Mezzi] ADD [OriginalPrice] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Mezzi] ADD [RevisionExpirationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [StampDutyExpirationDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [Tachograph] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [TwentyYearVerificationOfLiftingOrgans] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Mezzi] ADD [WearBook] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210527084055_MezziModelUpdate', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var32 sysname;
SELECT @var32 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'ContoProprioContoTerzi');
IF @var32 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var32 + '];');
ALTER TABLE [Mezzi] DROP COLUMN [ContoProprioContoTerzi];
GO

EXEC sp_rename N'[Mezzi].[Descrizione]', N'Description', N'COLUMN';
GO

EXEC sp_rename N'[Mezzi].[Costruttore]', N'Brand', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210527090004_avevosbagliatounacosanelmodellodeimezzioracorretto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Mezzi] ADD [ContoProprioContoTerzi] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210527090028_avevosbagliatounacosanelmodellodeimezzioracorrettofine', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Note] ADD [Author] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210601113803_added-fred-nota', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ThreadNota] (
    [Id] int NOT NULL IDENTITY,
    [IdReferredNote] int NOT NULL,
    [IdReferringNote] int NOT NULL,
    CONSTRAINT [PK_ThreadNota] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ThreadNota_Note_IdReferredNote] FOREIGN KEY ([IdReferredNote]) REFERENCES [Note] ([Id]),
    CONSTRAINT [FK_ThreadNota_Note_IdReferringNote] FOREIGN KEY ([IdReferringNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ThreadNota_IdReferredNote] ON [ThreadNota] ([IdReferredNote]);
GO

CREATE INDEX [IX_ThreadNota_IdReferringNote] ON [ThreadNota] ([IdReferringNote]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210601195109_frednota', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [BeniEServizi] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NULL,
    [Type] nvarchar(max) NULL,
    [Um] nvarchar(max) NULL,
    CONSTRAINT [PK_BeniEServizi] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [ServizioCliente] (
    [Id] int NOT NULL IDENTITY,
    [IdBeniEServizi] int NOT NULL,
    [pricePerUm] real NOT NULL,
    [IdCliente] int NULL,
    CONSTRAINT [PK_ServizioCliente] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ServizioCliente_BeniEServizi_IdBeniEServizi] FOREIGN KEY ([IdBeniEServizi]) REFERENCES [BeniEServizi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ServizioCliente_Clienti_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Clienti] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [ServizioFornitore] (
    [Id] int NOT NULL IDENTITY,
    [IdBeniEServizi] int NOT NULL,
    [pricePerUm] real NOT NULL,
    [IdFornitore] int NULL,
    [IdCliente] int NULL,
    CONSTRAINT [PK_ServizioFornitore] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ServizioFornitore_BeniEServizi_IdBeniEServizi] FOREIGN KEY ([IdBeniEServizi]) REFERENCES [BeniEServizi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ServizioFornitore_Fornitori_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Fornitori] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_ServizioCliente_IdBeniEServizi] ON [ServizioCliente] ([IdBeniEServizi]);
GO

CREATE INDEX [IX_ServizioCliente_IdCliente] ON [ServizioCliente] ([IdCliente]);
GO

CREATE INDEX [IX_ServizioFornitore_IdBeniEServizi] ON [ServizioFornitore] ([IdBeniEServizi]);
GO

CREATE INDEX [IX_ServizioFornitore_IdCliente] ON [ServizioFornitore] ([IdCliente]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210605080358_AggiuntoTabellePerBeniEServiziDiBase', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [BeniEServizi] ADD [IVA] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210605100159_AggiuntaIVAABeniEServizi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AttrezzaturaAT] (
    [Id] int NOT NULL IDENTITY,
    [Type] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Builder] nvarchar(max) NULL,
    [Model] nvarchar(max) NOT NULL,
    [LicensePlate] nvarchar(max) NOT NULL,
    [ProductionDate] datetime2 NULL,
    [PropertyOf] nvarchar(max) NOT NULL,
    [Idoneity] nvarchar(max) NULL,
    [TechnicalSpecs] nvarchar(max) NULL,
    [EstimatedValue] float NULL,
    [Position] nvarchar(max) NOT NULL,
    [Compatibility] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    CONSTRAINT [PK_AttrezzaturaAT] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [InventarioGenerale] (
    [Id] int NOT NULL IDENTITY,
    [Position] nvarchar(max) NULL,
    [Category] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [UM] nvarchar(max) NULL,
    [Quantity] int NULL,
    [InventoryValue] real NULL,
    CONSTRAINT [PK_InventarioGenerale] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [RisorseStrumentali] (
    [Id] int NOT NULL IDENTITY,
    [Position] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [UM] nvarchar(max) NOT NULL,
    [Quantity] int NOT NULL,
    [cost] float NULL,
    [MaintenanceExpiration] datetime2 NULL,
    [Usable] bit NULL,
    [Notes] nvarchar(max) NULL,
    CONSTRAINT [PK_RisorseStrumentali] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [StrumentiDiMisura] (
    [Id] int NOT NULL IDENTITY,
    [Type] nvarchar(max) NOT NULL,
    [Brand] nvarchar(max) NOT NULL,
    [Model] nvarchar(max) NOT NULL,
    [SerialNumber] nvarchar(max) NULL,
    [Registration] nvarchar(max) NULL,
    [Notes] nvarchar(max) NULL,
    [Status] nvarchar(max) NULL,
    [Invoice] nvarchar(max) NULL,
    [Idoneity] nvarchar(max) NULL,
    [TecSpecs] nvarchar(max) NULL,
    [CalibrationExpiration] datetime2 NOT NULL,
    CONSTRAINT [PK_StrumentiDiMisura] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618100516_AggiuntiTuttiCampiAttrezzatura', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var33 sysname;
SELECT @var33 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'Position');
IF @var33 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var33 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [Position] nvarchar(max) NULL;
GO

DECLARE @var34 sysname;
SELECT @var34 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'Model');
IF @var34 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var34 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [Model] nvarchar(max) NULL;
GO

DECLARE @var35 sysname;
SELECT @var35 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'LicensePlate');
IF @var35 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var35 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [LicensePlate] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618132217_aggiustatialcuninullablediattrezzaturaat', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var36 sysname;
SELECT @var36 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'PropertyOf');
IF @var36 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var36 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [PropertyOf] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618133809_aggiustatialcuninullablediattrezzaturaat1', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var37 sysname;
SELECT @var37 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InventarioGenerale]') AND [c].[name] = N'Description');
IF @var37 IS NOT NULL EXEC(N'ALTER TABLE [InventarioGenerale] DROP CONSTRAINT [' + @var37 + '];');
ALTER TABLE [InventarioGenerale] ALTER COLUMN [Description] nvarchar(max) NULL;
GO

DECLARE @var38 sysname;
SELECT @var38 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[InventarioGenerale]') AND [c].[name] = N'Category');
IF @var38 IS NOT NULL EXEC(N'ALTER TABLE [InventarioGenerale] DROP CONSTRAINT [' + @var38 + '];');
ALTER TABLE [InventarioGenerale] ALTER COLUMN [Category] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618135245_aggiustatialcuninullablediInventarioGenerale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var39 sysname;
SELECT @var39 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[StrumentiDiMisura]') AND [c].[name] = N'Type');
IF @var39 IS NOT NULL EXEC(N'ALTER TABLE [StrumentiDiMisura] DROP CONSTRAINT [' + @var39 + '];');
ALTER TABLE [StrumentiDiMisura] ALTER COLUMN [Type] nvarchar(max) NULL;
GO

DECLARE @var40 sysname;
SELECT @var40 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[StrumentiDiMisura]') AND [c].[name] = N'Model');
IF @var40 IS NOT NULL EXEC(N'ALTER TABLE [StrumentiDiMisura] DROP CONSTRAINT [' + @var40 + '];');
ALTER TABLE [StrumentiDiMisura] ALTER COLUMN [Model] nvarchar(max) NULL;
GO

DECLARE @var41 sysname;
SELECT @var41 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[StrumentiDiMisura]') AND [c].[name] = N'CalibrationExpiration');
IF @var41 IS NOT NULL EXEC(N'ALTER TABLE [StrumentiDiMisura] DROP CONSTRAINT [' + @var41 + '];');
ALTER TABLE [StrumentiDiMisura] ALTER COLUMN [CalibrationExpiration] datetime2 NULL;
GO

DECLARE @var42 sysname;
SELECT @var42 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[StrumentiDiMisura]') AND [c].[name] = N'Brand');
IF @var42 IS NOT NULL EXEC(N'ALTER TABLE [StrumentiDiMisura] DROP CONSTRAINT [' + @var42 + '];');
ALTER TABLE [StrumentiDiMisura] ALTER COLUMN [Brand] nvarchar(max) NULL;
GO

DECLARE @var43 sysname;
SELECT @var43 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[RisorseStrumentali]') AND [c].[name] = N'UM');
IF @var43 IS NOT NULL EXEC(N'ALTER TABLE [RisorseStrumentali] DROP CONSTRAINT [' + @var43 + '];');
ALTER TABLE [RisorseStrumentali] ALTER COLUMN [UM] nvarchar(max) NULL;
GO

DECLARE @var44 sysname;
SELECT @var44 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[RisorseStrumentali]') AND [c].[name] = N'Quantity');
IF @var44 IS NOT NULL EXEC(N'ALTER TABLE [RisorseStrumentali] DROP CONSTRAINT [' + @var44 + '];');
ALTER TABLE [RisorseStrumentali] ALTER COLUMN [Quantity] int NULL;
GO

DECLARE @var45 sysname;
SELECT @var45 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[RisorseStrumentali]') AND [c].[name] = N'Position');
IF @var45 IS NOT NULL EXEC(N'ALTER TABLE [RisorseStrumentali] DROP CONSTRAINT [' + @var45 + '];');
ALTER TABLE [RisorseStrumentali] ALTER COLUMN [Position] nvarchar(max) NULL;
GO

DECLARE @var46 sysname;
SELECT @var46 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[RisorseStrumentali]') AND [c].[name] = N'Description');
IF @var46 IS NOT NULL EXEC(N'ALTER TABLE [RisorseStrumentali] DROP CONSTRAINT [' + @var46 + '];');
ALTER TABLE [RisorseStrumentali] ALTER COLUMN [Description] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618142454_aggiustatialcuninullablediInventarioGenerale1', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP TABLE [RisorseStrumentali];
GO

CREATE TABLE [DPI] (
    [Id] int NOT NULL IDENTITY,
    [Position] nvarchar(max) NULL,
    [Description] nvarchar(max) NULL,
    [UM] nvarchar(max) NULL,
    [Quantity] int NULL,
    [cost] float NULL,
    [MaintenanceExpiration] datetime2 NULL,
    [Usable] bit NULL,
    [Notes] nvarchar(max) NULL,
    CONSTRAINT [PK_DPI] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210618143309_agggiustatavocedpi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var47 sysname;
SELECT @var47 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'Type');
IF @var47 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var47 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [Type] nvarchar(max) NULL;
GO

DECLARE @var48 sysname;
SELECT @var48 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'ProductionDate');
IF @var48 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var48 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [ProductionDate] nvarchar(max) NULL;
GO

DECLARE @var49 sysname;
SELECT @var49 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AttrezzaturaAT]') AND [c].[name] = N'Description');
IF @var49 IS NOT NULL EXEC(N'ALTER TABLE [AttrezzaturaAT] DROP CONSTRAINT [' + @var49 + '];');
ALTER TABLE [AttrezzaturaAT] ALTER COLUMN [Description] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210619115957_aggiustatomodelloattrezzaturat', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Contratto] (
    [Id] int NOT NULL IDENTITY,
    [IdCliente] int NOT NULL,
    [shortDescription] nvarchar(max) NULL,
    [longDescription] nvarchar(max) NULL,
    [cig] nvarchar(max) NULL,
    [cup] nvarchar(max) NULL,
    [soa] nvarchar(max) NULL,
    [idPm] int NOT NULL,
    [Place] nvarchar(max) NULL,
    [status] nvarchar(max) NULL,
    [YearOfCompletition] nvarchar(max) NULL,
    [netContractualAmount] int NULL,
    [extraWorkAmount] int NULL,
    CONSTRAINT [PK_Contratto] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Contratto_Clienti_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Clienti] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Contratto_Personale_idPm] FOREIGN KEY ([idPm]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Contratto_IdCliente] ON [Contratto] ([IdCliente]);
GO

CREATE INDEX [IX_Contratto_idPm] ON [Contratto] ([idPm]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210619124348_AggiuntiCOntratti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] ADD [extraordinaryPrice] float NULL;
GO

ALTER TABLE [Personale] ADD [ordinaryPrice] float NULL;
GO

ALTER TABLE [Personale] ADD [skills] nvarchar(max) NULL;
GO

CREATE TABLE [InventoryItem] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max) NOT NULL,
    [Model] nvarchar(max) NOT NULL,
    [SerialNumberOrLicensePlate] nvarchar(max) NOT NULL,
    [BrandOrBuilder] nvarchar(max) NOT NULL,
    [Position] nvarchar(max) NOT NULL,
    [ExtimatedValue] float NOT NULL,
    CONSTRAINT [PK_InventoryItem] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Prop] (
    [Id] int NOT NULL IDENTITY,
    [PropertyName] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Discriminator] nvarchar(max) NOT NULL,
    [Data] datetime2 NULL,
    [PropValue] float NULL,
    [StringProp_PropValue] nvarchar(max) NULL,
    CONSTRAINT [PK_Prop] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [InventoryPropsList] (
    [Id] int NOT NULL IDENTITY,
    [PropId] int NOT NULL,
    [InventoryItemId] int NOT NULL,
    CONSTRAINT [PK_InventoryPropsList] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_InventoryPropsList_InventoryItem_InventoryItemId] FOREIGN KEY ([InventoryItemId]) REFERENCES [InventoryItem] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_InventoryPropsList_Prop_PropId] FOREIGN KEY ([PropId]) REFERENCES [Prop] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_InventoryPropsList_InventoryItemId] ON [InventoryPropsList] ([InventoryItemId]);
GO

CREATE INDEX [IX_InventoryPropsList_PropId] ON [InventoryPropsList] ([PropId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210628160330_modificatoModellaPersona', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] ADD [travelPrice] float NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210705113454_travel-price', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ServizioFornitore] DROP CONSTRAINT [FK_ServizioFornitore_Fornitori_IdCliente];
GO

DROP INDEX [IX_ServizioFornitore_IdCliente] ON [ServizioFornitore];
GO

DECLARE @var50 sysname;
SELECT @var50 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ServizioFornitore]') AND [c].[name] = N'IdCliente');
IF @var50 IS NOT NULL EXEC(N'ALTER TABLE [ServizioFornitore] DROP CONSTRAINT [' + @var50 + '];');
ALTER TABLE [ServizioFornitore] DROP COLUMN [IdCliente];
GO

CREATE INDEX [IX_ServizioFornitore_IdFornitore] ON [ServizioFornitore] ([IdFornitore]);
GO

ALTER TABLE [ServizioFornitore] ADD CONSTRAINT [FK_ServizioFornitore_Fornitori_IdFornitore] FOREIGN KEY ([IdFornitore]) REFERENCES [Fornitori] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210721082210_CorrezioneServizioFornitore', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ServizioCliente] DROP CONSTRAINT [FK_ServizioCliente_BeniEServizi_IdBeniEServizi];
GO

ALTER TABLE [ServizioCliente] DROP CONSTRAINT [FK_ServizioCliente_Clienti_IdCliente];
GO

DROP TABLE [ServizioFornitore];
GO

DROP INDEX [IX_ServizioCliente_IdCliente] ON [ServizioCliente];
GO

DECLARE @var51 sysname;
SELECT @var51 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ServizioCliente]') AND [c].[name] = N'IdCliente');
IF @var51 IS NOT NULL EXEC(N'ALTER TABLE [ServizioCliente] DROP CONSTRAINT [' + @var51 + '];');
ALTER TABLE [ServizioCliente] DROP COLUMN [IdCliente];
GO

DECLARE @var52 sysname;
SELECT @var52 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[BeniEServizi]') AND [c].[name] = N'IVA');
IF @var52 IS NOT NULL EXEC(N'ALTER TABLE [BeniEServizi] DROP CONSTRAINT [' + @var52 + '];');
ALTER TABLE [BeniEServizi] DROP COLUMN [IVA];
GO

EXEC sp_rename N'[ServizioCliente].[pricePerUm]', N'PricePerUm', N'COLUMN';
GO

EXEC sp_rename N'[ServizioCliente].[Id]', N'ID', N'COLUMN';
GO

EXEC sp_rename N'[ServizioCliente].[IdBeniEServizi]', N'IdPrezziario', N'COLUMN';
GO

EXEC sp_rename N'[ServizioCliente].[IX_ServizioCliente_IdBeniEServizi]', N'IX_ServizioCliente_IdPrezziario', N'INDEX';
GO

EXEC sp_rename N'[BeniEServizi].[Um]', N'ValidationYear', N'COLUMN';
GO

DECLARE @var53 sysname;
SELECT @var53 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ServizioCliente]') AND [c].[name] = N'PricePerUm');
IF @var53 IS NOT NULL EXEC(N'ALTER TABLE [ServizioCliente] DROP CONSTRAINT [' + @var53 + '];');
ALTER TABLE [ServizioCliente] ALTER COLUMN [PricePerUm] float NOT NULL;
GO

ALTER TABLE [ServizioCliente] ADD [Name] nvarchar(max) NULL;
GO

ALTER TABLE [ServizioCliente] ADD [Type] nvarchar(max) NULL;
GO

ALTER TABLE [ServizioCliente] ADD [UM] nvarchar(max) NULL;
GO

ALTER TABLE [Contratto] ADD [IdPrezziarioGenerale] int NOT NULL DEFAULT 0;
GO

CREATE TABLE [ScontoCliente] (
    [Id] int NOT NULL IDENTITY,
    [IdPrezziarioCliente] int NOT NULL,
    [Sconto] int NOT NULL,
    [IdCliente] int NOT NULL,
    CONSTRAINT [PK_ScontoCliente] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ScontoCliente_BeniEServizi_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [BeniEServizi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ScontoCliente_Clienti_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Clienti] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ScontoCliente_IdCliente] ON [ScontoCliente] ([IdCliente]);
GO

CREATE INDEX [IX_ScontoCliente_IdPrezziarioCliente] ON [ScontoCliente] ([IdPrezziarioCliente]);
GO

ALTER TABLE [ServizioCliente] ADD CONSTRAINT [FK_ServizioCliente_BeniEServizi_IdPrezziario] FOREIGN KEY ([IdPrezziario]) REFERENCES [BeniEServizi] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210721104247_sistematoPrezziarioClienteERelativiServizi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ScontoCliente] DROP CONSTRAINT [FK_ScontoCliente_BeniEServizi_IdPrezziarioCliente];
GO

ALTER TABLE [ServizioCliente] DROP CONSTRAINT [FK_ServizioCliente_BeniEServizi_IdPrezziario];
GO

ALTER TABLE [BeniEServizi] DROP CONSTRAINT [PK_BeniEServizi];
GO

EXEC sp_rename N'[BeniEServizi]', N'PrezziarioCliente';
GO

ALTER TABLE [PrezziarioCliente] ADD CONSTRAINT [PK_PrezziarioCliente] PRIMARY KEY ([Id]);
GO

ALTER TABLE [ScontoCliente] ADD CONSTRAINT [FK_ScontoCliente_PrezziarioCliente_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [ServizioCliente] ADD CONSTRAINT [FK_ServizioCliente_PrezziarioCliente_IdPrezziario] FOREIGN KEY ([IdPrezziario]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210721104954_sistematoPrezziarioClienteERelativiServizi1', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[Contratto].[IdPrezziarioGenerale]', N'IdPrezziarioCliente', N'COLUMN';
GO

CREATE INDEX [IX_Contratto_IdPrezziarioCliente] ON [Contratto] ([IdPrezziarioCliente]);
GO

ALTER TABLE [Contratto] ADD CONSTRAINT [FK_Contratto_PrezziarioCliente_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210721112923_aggiuntoRiferimentoAPrezziarioClienteSuContratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Saltura] (
    [Id] int NOT NULL IDENTITY,
    [NumeroFattura] int NOT NULL,
    [IVA] int NOT NULL,
    [State] nvarchar(max) NULL,
    [TotalValue] float NOT NULL,
    [IssueDate] datetime2 NOT NULL,
    [ExpirationDate] datetime2 NOT NULL,
    [RecessDate] datetime2 NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_Saltura] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Saltura_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AttachmentsSaltura] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdSaltura] int NOT NULL,
    CONSTRAINT [PK_AttachmentsSaltura] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AttachmentsSaltura_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AttachmentsSaltura_Saltura_IdSaltura] FOREIGN KEY ([IdSaltura]) REFERENCES [Saltura] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AttachmentsSaltura_IdFile] ON [AttachmentsSaltura] ([IdFile]);
GO

CREATE INDEX [IX_AttachmentsSaltura_IdSaltura] ON [AttachmentsSaltura] ([IdSaltura]);
GO

CREATE INDEX [IX_Saltura_IdCantiere] ON [Saltura] ([IdCantiere]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210721131538_AggiunteSALfatture', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ServizioCliente] ADD [IVA] int NOT NULL DEFAULT 0;
GO

CREATE TABLE [ServizioFornitore] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NULL,
    [Type] nvarchar(max) NULL,
    [UM] nvarchar(max) NULL,
    [PricePerUM] float NOT NULL,
    [IVA] int NOT NULL,
    [IdFornitore] int NOT NULL,
    CONSTRAINT [PK_ServizioFornitore] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ServizioFornitore_Fornitori_IdFornitore] FOREIGN KEY ([IdFornitore]) REFERENCES [Fornitori] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ServizioFornitore_IdFornitore] ON [ServizioFornitore] ([IdFornitore]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210727161326_aggiuntaivaservizioclienteecreatoserviziofornitore', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [idContratto] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210727180958_id-contratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[ServizioFornitore].[Type]', N'Description', N'COLUMN';
GO

EXEC sp_rename N'[ServizioFornitore].[Name]', N'Category', N'COLUMN';
GO

EXEC sp_rename N'[ServizioCliente].[Type]', N'Description', N'COLUMN';
GO

EXEC sp_rename N'[ServizioCliente].[Name]', N'Category', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210727201924_aggiustatinomidelcazzo', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] DROP CONSTRAINT [FK_Cantiere_Clienti_IdClienti];
GO

EXEC sp_rename N'[Cantiere].[IdClienti]', N'ContrattoId', N'COLUMN';
GO

EXEC sp_rename N'[Cantiere].[IX_Cantiere_IdClienti]', N'IX_Cantiere_ContrattoId', N'INDEX';
GO

DECLARE @var54 sysname;
SELECT @var54 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TimeCard]') AND [c].[name] = N'EndDate');
IF @var54 IS NOT NULL EXEC(N'ALTER TABLE [TimeCard] DROP CONSTRAINT [' + @var54 + '];');
ALTER TABLE [TimeCard] ALTER COLUMN [EndDate] datetime2 NULL;
GO

ALTER TABLE [TimeCard] ADD [Type] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Cantiere] ADD CONSTRAINT [FK_Cantiere_Contratto_ContrattoId] FOREIGN KEY ([ContrattoId]) REFERENCES [Contratto] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210729095350_modificatagestionetimecardECorrettoloopidclientesucontrattoecantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] DROP CONSTRAINT [FK_Cantiere_Contratto_ContrattoId];
GO

EXEC sp_rename N'[Cantiere].[ContrattoId]', N'IdContratto', N'COLUMN';
GO

EXEC sp_rename N'[Cantiere].[IX_Cantiere_ContrattoId]', N'IX_Cantiere_IdContratto', N'INDEX';
GO

ALTER TABLE [Cantiere] ADD CONSTRAINT [FK_Cantiere_Contratto_IdContratto] FOREIGN KEY ([IdContratto]) REFERENCES [Contratto] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210729095515_AGGIUSTATObUGsqlDIMERDA', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP TABLE [InventoryPropsList];
GO

DROP TABLE [InventoryItem];
GO

DROP TABLE [Prop];
GO

ALTER TABLE [TimeCard] ADD [IdReport] int NOT NULL DEFAULT 0;
GO

CREATE TABLE [ReportDiCantiere] (
    [Id] int NOT NULL IDENTITY,
    [date] datetime2 NOT NULL,
    [SignId] int NOT NULL,
    [JObject] nvarchar(max) NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_ReportDiCantiere] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ReportDiCantiere_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ReportDiCantiere_File_SignId] FOREIGN KEY ([SignId]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ListOfGoodsAndServicesInUse] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max) NULL,
    [Quantity] float NOT NULL,
    [ServizioId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_ListOfGoodsAndServicesInUse] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListOfGoodsAndServicesInUse_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListOfGoodsAndServicesInUse_ServizioFornitore_ServizioId] FOREIGN KEY ([ServizioId]) REFERENCES [ServizioFornitore] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ListOfServicesSoldToClient] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max) NULL,
    [Quantity] float NOT NULL,
    [ServizioId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_ListOfServicesSoldToClient] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListOfServicesSoldToClient_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListOfServicesSoldToClient_ServizioCliente_ServizioId] FOREIGN KEY ([ServizioId]) REFERENCES [ServizioCliente] ([ID]) ON DELETE CASCADE
);
GO

CREATE TABLE [VehicleCard] (
    [Id] int NOT NULL IDENTITY,
    [NumberOfHoursOfUsage] int NOT NULL,
    [BeginningDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [LitersOfFuel] float NOT NULL,
    [FuelCost] float NOT NULL,
    [MezzoId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_VehicleCard] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_VehicleCard_Mezzi_MezzoId] FOREIGN KEY ([MezzoId]) REFERENCES [Mezzi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_VehicleCard_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_TimeCard_IdReport] ON [TimeCard] ([IdReport]);
GO

CREATE INDEX [IX_ListOfGoodsAndServicesInUse_IdReport] ON [ListOfGoodsAndServicesInUse] ([IdReport]);
GO

CREATE INDEX [IX_ListOfGoodsAndServicesInUse_ServizioId] ON [ListOfGoodsAndServicesInUse] ([ServizioId]);
GO

CREATE INDEX [IX_ListOfServicesSoldToClient_IdReport] ON [ListOfServicesSoldToClient] ([IdReport]);
GO

CREATE INDEX [IX_ListOfServicesSoldToClient_ServizioId] ON [ListOfServicesSoldToClient] ([ServizioId]);
GO

CREATE INDEX [IX_ReportDiCantiere_IdCantiere] ON [ReportDiCantiere] ([IdCantiere]);
GO

CREATE INDEX [IX_ReportDiCantiere_SignId] ON [ReportDiCantiere] ([SignId]);
GO

CREATE INDEX [IX_VehicleCard_IdReport] ON [VehicleCard] ([IdReport]);
GO

CREATE INDEX [IX_VehicleCard_MezzoId] ON [VehicleCard] ([MezzoId]);
GO

ALTER TABLE [TimeCard] ADD CONSTRAINT [FK_TimeCard_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210729153836_reportDiCantiereELimitrofiMenoIDocumenti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [DocumentsList] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdReport] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_DocumentsList] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DocumentsList_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DocumentsList_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DocumentsList_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id])
);
GO

CREATE INDEX [IX_DocumentsList_IdCantiere] ON [DocumentsList] ([IdCantiere]);
GO

CREATE INDEX [IX_DocumentsList_IdFile] ON [DocumentsList] ([IdFile]);
GO

CREATE INDEX [IX_DocumentsList_IdReport] ON [DocumentsList] ([IdReport]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210729155611_modificataLogicaFirmaReportFanculoSQL', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ScadenzePersonale] (
    [Id] int NOT NULL IDENTITY,
    [PerformingDate] datetime2 NOT NULL,
    [IdPersonale] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_ScadenzePersonale] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ScadenzePersonale_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ScadenzePersonale_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ScadenzePersonale_IdNote] ON [ScadenzePersonale] ([IdNote]);
GO

CREATE INDEX [IX_ScadenzePersonale_IdPersonale] ON [ScadenzePersonale] ([IdPersonale]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210802075637_AggiunteScadenzePersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Mezzi] ADD [DailyCost] float NOT NULL DEFAULT 0.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210803135727_aggiuntoCostoGiornalieroSuiMezzi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP TABLE [DocumentsList];
GO

DROP TABLE [ListOfGoodsAndServicesInUse];
GO

DROP TABLE [ListOfServicesSoldToClient];
GO

DROP TABLE [VehicleCard];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210804083523_rimosseDifferenzeDaModelliDanilo', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] DROP CONSTRAINT [FK_ReportDiCantiere_File_SignId];
GO

DROP INDEX [IX_ReportDiCantiere_SignId] ON [ReportDiCantiere];
GO

DECLARE @var55 sysname;
SELECT @var55 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ReportDiCantiere]') AND [c].[name] = N'SignId');
IF @var55 IS NOT NULL EXEC(N'ALTER TABLE [ReportDiCantiere] DROP CONSTRAINT [' + @var55 + '];');
ALTER TABLE [ReportDiCantiere] DROP COLUMN [SignId];
GO

DECLARE @var56 sysname;
SELECT @var56 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TimeCard]') AND [c].[name] = N'Type');
IF @var56 IS NOT NULL EXEC(N'ALTER TABLE [TimeCard] DROP CONSTRAINT [' + @var56 + '];');
ALTER TABLE [TimeCard] ALTER COLUMN [Type] int NOT NULL;
GO

ALTER TABLE [ReportDiCantiere] ADD [Sign] nvarchar(max) NULL;
GO

ALTER TABLE [Personale] ADD [IdPicture] int NULL;
GO

CREATE TABLE [DocumentsList] (
    [Id] int NOT NULL IDENTITY,
    [IdFile] int NOT NULL,
    [IdReport] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_DocumentsList] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DocumentsList_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DocumentsList_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DocumentsList_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id])
);
GO

CREATE TABLE [ListOfGoodsAndServicesInUse] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max) NULL,
    [Quantity] float NOT NULL,
    [ServizioId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_ListOfGoodsAndServicesInUse] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListOfGoodsAndServicesInUse_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListOfGoodsAndServicesInUse_ServizioFornitore_ServizioId] FOREIGN KEY ([ServizioId]) REFERENCES [ServizioFornitore] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ListOfServicesSoldToClient] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(max) NULL,
    [Quantity] float NOT NULL,
    [ServizioId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_ListOfServicesSoldToClient] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListOfServicesSoldToClient_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListOfServicesSoldToClient_ServizioCliente_ServizioId] FOREIGN KEY ([ServizioId]) REFERENCES [ServizioCliente] ([ID]) ON DELETE CASCADE
);
GO

CREATE TABLE [VehicleCard] (
    [Id] int NOT NULL IDENTITY,
    [NumberOfHoursOfUsage] int NOT NULL,
    [BeginningDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [LitersOfFuel] float NOT NULL,
    [FuelCost] float NOT NULL,
    [MezzoId] int NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_VehicleCard] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_VehicleCard_Mezzi_MezzoId] FOREIGN KEY ([MezzoId]) REFERENCES [Mezzi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_VehicleCard_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Personale_IdPicture] ON [Personale] ([IdPicture]);
GO

CREATE INDEX [IX_DocumentsList_IdCantiere] ON [DocumentsList] ([IdCantiere]);
GO

CREATE INDEX [IX_DocumentsList_IdFile] ON [DocumentsList] ([IdFile]);
GO

CREATE INDEX [IX_DocumentsList_IdReport] ON [DocumentsList] ([IdReport]);
GO

CREATE INDEX [IX_ListOfGoodsAndServicesInUse_IdReport] ON [ListOfGoodsAndServicesInUse] ([IdReport]);
GO

CREATE INDEX [IX_ListOfGoodsAndServicesInUse_ServizioId] ON [ListOfGoodsAndServicesInUse] ([ServizioId]);
GO

CREATE INDEX [IX_ListOfServicesSoldToClient_IdReport] ON [ListOfServicesSoldToClient] ([IdReport]);
GO

CREATE INDEX [IX_ListOfServicesSoldToClient_ServizioId] ON [ListOfServicesSoldToClient] ([ServizioId]);
GO

CREATE INDEX [IX_VehicleCard_IdReport] ON [VehicleCard] ([IdReport]);
GO

CREATE INDEX [IX_VehicleCard_MezzoId] ON [VehicleCard] ([MezzoId]);
GO

ALTER TABLE [Personale] ADD CONSTRAINT [FK_Personale_File_IdPicture] FOREIGN KEY ([IdPicture]) REFERENCES [File] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210810143711_aggiuntaImmagineProfilo', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Clienti] ADD [CF] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210817095950_cf-cliente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Clienti] ADD [File] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210817102241_profilo-cliente-foto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Clienti] ADD [City] nvarchar(max) NULL;
GO

ALTER TABLE [Clienti] ADD [Province] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210828113531_updatedClientiModel', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Contratto] DROP CONSTRAINT [FK_Contratto_Clienti_IdCliente];
GO

ALTER TABLE [Contratto] DROP CONSTRAINT [FK_Contratto_Personale_idPm];
GO

ALTER TABLE [Contratto] DROP CONSTRAINT [FK_Contratto_PrezziarioCliente_IdPrezziarioCliente];
GO

DECLARE @var57 sysname;
SELECT @var57 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'idPm');
IF @var57 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var57 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [idPm] int NULL;
GO

DECLARE @var58 sysname;
SELECT @var58 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'IdPrezziarioCliente');
IF @var58 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var58 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [IdPrezziarioCliente] int NULL;
GO

DECLARE @var59 sysname;
SELECT @var59 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'IdCliente');
IF @var59 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var59 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [IdCliente] int NULL;
GO

ALTER TABLE [Contratto] ADD CONSTRAINT [FK_Contratto_Clienti_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Clienti] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Contratto] ADD CONSTRAINT [FK_Contratto_Personale_idPm] FOREIGN KEY ([idPm]) REFERENCES [Personale] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Contratto] ADD CONSTRAINT [FK_Contratto_PrezziarioCliente_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210828113646_ModificataCampiContratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] DROP CONSTRAINT [FK_Personale_File_IdPicture];
GO

DROP INDEX [IX_Personale_IdPicture] ON [Personale];
GO

DECLARE @var60 sysname;
SELECT @var60 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'IdPicture');
IF @var60 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var60 + '];');
ALTER TABLE [Personale] DROP COLUMN [IdPicture];
GO

ALTER TABLE [Personale] ADD [File] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210831135310_modifcaFotoPersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [cse] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [dl] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [rup] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210908160857_Aggiunti_dl_cs_rup_a_cantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var61 sysname;
SELECT @var61 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'cig');
IF @var61 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var61 + '];');
ALTER TABLE [Cantiere] DROP COLUMN [cig];
GO

DECLARE @var62 sysname;
SELECT @var62 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'cup');
IF @var62 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var62 + '];');
ALTER TABLE [Cantiere] DROP COLUMN [cup];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210908161933_RimossiCigECupDa_cantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var63 sysname;
SELECT @var63 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'oda');
IF @var63 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var63 + '];');
ALTER TABLE [Cantiere] DROP COLUMN [oda];
GO

ALTER TABLE [Contratto] ADD [oda] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210908162228_aggiuntoODAalContratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Personale] ADD [inStrenght] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210910125425_aggiuntoInStrenghtAPersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var64 sysname;
SELECT @var64 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ScadenzePersonale]') AND [c].[name] = N'PerformingDate');
IF @var64 IS NOT NULL EXEC(N'ALTER TABLE [ScadenzePersonale] DROP CONSTRAINT [' + @var64 + '];');
ALTER TABLE [ScadenzePersonale] ALTER COLUMN [PerformingDate] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210911092917_messaDataEffetuazioneScadenzPersonaleNullable', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ScadenzeMezzi] (
    [Id] int NOT NULL IDENTITY,
    [PerformingDate] datetime2 NULL,
    [IdMezzi] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_ScadenzeMezzi] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ScadenzeMezzi_Mezzi_IdMezzi] FOREIGN KEY ([IdMezzi]) REFERENCES [Mezzi] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ScadenzeMezzi_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ScadenzeMezzi_IdMezzi] ON [ScadenzeMezzi] ([IdMezzi]);
GO

CREATE INDEX [IX_ScadenzeMezzi_IdNote] ON [ScadenzeMezzi] ([IdNote]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210913104645_AggiunteScadenzeMezzi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var65 sysname;
SELECT @var65 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'WearBook');
IF @var65 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var65 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [WearBook] datetime2 NULL;
GO

DECLARE @var66 sysname;
SELECT @var66 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'TwentyYearVerificationOfLiftingOrgans');
IF @var66 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var66 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [TwentyYearVerificationOfLiftingOrgans] datetime2 NULL;
GO

DECLARE @var67 sysname;
SELECT @var67 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'Tachograph');
IF @var67 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var67 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [Tachograph] datetime2 NULL;
GO

DECLARE @var68 sysname;
SELECT @var68 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'StampDutyExpirationDate');
IF @var68 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var68 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [StampDutyExpirationDate] datetime2 NULL;
GO

DECLARE @var69 sysname;
SELECT @var69 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'RevisionExpirationDate');
IF @var69 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var69 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [RevisionExpirationDate] datetime2 NULL;
GO

DECLARE @var70 sysname;
SELECT @var70 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'OriginalPrice');
IF @var70 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var70 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [OriginalPrice] float NULL;
GO

DECLARE @var71 sysname;
SELECT @var71 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'MatriculationDate');
IF @var71 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var71 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [MatriculationDate] datetime2 NULL;
GO

DECLARE @var72 sysname;
SELECT @var72 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'LicenseCProprio');
IF @var72 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var72 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [LicenseCProprio] datetime2 NULL;
GO

DECLARE @var73 sysname;
SELECT @var73 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'InsuranceExpirationDate');
IF @var73 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var73 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [InsuranceExpirationDate] datetime2 NULL;
GO

DECLARE @var74 sysname;
SELECT @var74 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'ISPSEL');
IF @var74 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var74 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [ISPSEL] datetime2 NULL;
GO

DECLARE @var75 sysname;
SELECT @var75 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'FurtoIncendio');
IF @var75 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var75 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [FurtoIncendio] datetime2 NULL;
GO

DECLARE @var76 sysname;
SELECT @var76 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'ExtimatedValue');
IF @var76 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var76 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [ExtimatedValue] float NULL;
GO

ALTER TABLE [Mezzi] ADD [inStrenght] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210913132539_aggiuntoInstrenghtMezzo', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ServizioCliente] ADD [rateCode] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210914183523_aggiuntoRateCodeSuServizioCliente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Clienti] ADD [payments] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210914205146_aggiuntoPaymentsSuClienti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Fornitori] ADD [CF] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210914210346_CFFornitori', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210914212141_creataTabellaScadenzeFornitori', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ScadenzeFornitori] (
    [Id] int NOT NULL IDENTITY,
    [PerformingDate] datetime2 NULL,
    [IdFornitori] int NOT NULL,
    [IdNote] int NOT NULL,
    CONSTRAINT [PK_ScadenzeFornitori] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ScadenzeFornitori_Fornitori_IdFornitori] FOREIGN KEY ([IdFornitori]) REFERENCES [Fornitori] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ScadenzeFornitori_Note_IdNote] FOREIGN KEY ([IdNote]) REFERENCES [Note] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ScadenzeFornitori_IdFornitori] ON [ScadenzeFornitori] ([IdFornitori]);
GO

CREATE INDEX [IX_ScadenzeFornitori_IdNote] ON [ScadenzeFornitori] ([IdNote]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210914213144_creataTabellaScadenzeFornitori2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Fornitori] ADD [File] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210927193524_AggiuntaImmagineProfiloFornitori', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210927201454_aggiuntaListaAttachmentsAttrezzatura', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [attachementsAttrezzatura] (
    [Id] int NOT NULL IDENTITY,
    [IdAttrezzaturaAt] int NOT NULL,
    [IdFile] int NOT NULL,
    CONSTRAINT [PK_attachementsAttrezzatura] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_attachementsAttrezzatura_AttrezzaturaAT_IdAttrezzaturaAt] FOREIGN KEY ([IdAttrezzaturaAt]) REFERENCES [AttrezzaturaAT] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_attachementsAttrezzatura_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_attachementsAttrezzatura_IdAttrezzaturaAt] ON [attachementsAttrezzatura] ([IdAttrezzaturaAt]);
GO

CREATE INDEX [IX_attachementsAttrezzatura_IdFile] ON [attachementsAttrezzatura] ([IdFile]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210927201642_aggiuntaListaAttachmentsAttrezzatura1', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ListaFileDiCantiere] ADD [type] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210930122944_aggiuntoCampoTipoSuTabellaPivotListaFileDiCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[ListaPersonaleAssegnatoDiCantiere].[toDate]', N'ToDate', N'COLUMN';
GO

EXEC sp_rename N'[ListaPersonaleAssegnatoDiCantiere].[fromDate]', N'FromDate', N'COLUMN';
GO

DECLARE @var77 sysname;
SELECT @var77 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ListaPersonaleAssegnatoDiCantiere]') AND [c].[name] = N'ToDate');
IF @var77 IS NOT NULL EXEC(N'ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] DROP CONSTRAINT [' + @var77 + '];');
ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] ALTER COLUMN [ToDate] datetime2 NULL;
GO

DECLARE @var78 sysname;
SELECT @var78 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ListaPersonaleAssegnatoDiCantiere]') AND [c].[name] = N'FromDate');
IF @var78 IS NOT NULL EXEC(N'ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] DROP CONSTRAINT [' + @var78 + '];');
ALTER TABLE [ListaPersonaleAssegnatoDiCantiere] ALTER COLUMN [FromDate] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210930204016_messoNullableSulleDateDiAssegnamentoAiCantieri', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var79 sysname;
SELECT @var79 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'IVA');
IF @var79 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var79 + '];');
ALTER TABLE [Saltura] DROP COLUMN [IVA];
GO

DECLARE @var80 sysname;
SELECT @var80 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'NumeroFattura');
IF @var80 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var80 + '];');
ALTER TABLE [Saltura] DROP COLUMN [NumeroFattura];
GO

DECLARE @var81 sysname;
SELECT @var81 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'TotalValue');
IF @var81 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var81 + '];');
ALTER TABLE [Saltura] DROP COLUMN [TotalValue];
GO

EXEC sp_rename N'[Saltura].[State]', N'descriptionNumberSal', N'COLUMN';
GO

EXEC sp_rename N'[Saltura].[RecessDate]', N'dataScadenzaFattura', N'COLUMN';
GO

EXEC sp_rename N'[Saltura].[IssueDate]', N'dataIncassoFattura', N'COLUMN';
GO

EXEC sp_rename N'[Saltura].[ExpirationDate]', N'dataEmissioneSAL', N'COLUMN';
GO

ALTER TABLE [Saltura] ADD [dataEmissioneCP] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Saltura] ADD [dataEmissioneFattura] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Saltura] ADD [descriptionNumberCP] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [descriptionNumberFattura] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211002135109_SalturaV2Parziale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Saltura] ADD [accidentsWithholding] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [contractualAdvance] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [cpState] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [delayDaysFattura] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Saltura] ADD [fatturaState] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [iva] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [ivaAmountFattura] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Saltura] ADD [netAmountCP] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Saltura] ADD [netAmountFattura] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Saltura] ADD [netAmountSAL] nvarchar(max) NULL;
GO

ALTER TABLE [Saltura] ADD [salState] nvarchar(max) NULL;
GO

ALTER TABLE [AttachmentsSaltura] ADD [order] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211002152650_FinancialVardoV1.0', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var82 sysname;
SELECT @var82 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'YearOfCompletition');
IF @var82 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var82 + '];');
ALTER TABLE [Contratto] DROP COLUMN [YearOfCompletition];
GO

DECLARE @var83 sysname;
SELECT @var83 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'extraWorkAmount');
IF @var83 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var83 + '];');
ALTER TABLE [Contratto] DROP COLUMN [extraWorkAmount];
GO

EXEC sp_rename N'[Cantiere].[budget]', N'workBudget', N'COLUMN';
GO

ALTER TABLE [Contratto] ADD [additionalChargesAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [additionalGrossWorkAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [additionalNetAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [contractCode] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [Contratto] ADD [discount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [endingDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Contratto] ADD [initialChargesAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [initialGrossWorkAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [orderedImport] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [residualImport] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [startDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Contratto] ADD [startNetAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [totalAmountDiscounted] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [totalChargesAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [totalGrossWorkAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Contratto] ADD [totalNetAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Clienti] ADD [legalForm] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [SOA] nvarchar(max) NULL;
GO

ALTER TABLE [Cantiere] ADD [additionalActsBudget] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [cap] smallint NOT NULL DEFAULT CAST(0 AS smallint);
GO

ALTER TABLE [Cantiere] ADD [chargesBudget] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [finalAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [orderAmount] int NOT NULL DEFAULT 0;
GO

CREATE TABLE [FinancialCard] (
    [Id] int NOT NULL IDENTITY,
    [creditiVsClienti] int NOT NULL,
    [daContabilizzare] nvarchar(max) NULL,
    [daFatturare] nvarchar(max) NULL,
    [daIncassare] nvarchar(max) NULL,
    [debitiABreve] nvarchar(max) NULL,
    [anticipazioniDaRestituire] nvarchar(max) NULL,
    [debitiVsFornitori] nvarchar(max) NULL,
    [paghe] nvarchar(max) NULL,
    [fattureRicevute] nvarchar(max) NULL,
    [fattureDaRicevere] nvarchar(max) NULL,
    [saldo] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_FinancialCard] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_FinancialCard_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_FinancialCard_IdCantiere] ON [FinancialCard] ([IdCantiere]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211004092630_finanacilaCardsv2', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var84 sysname;
SELECT @var84 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'cap');
IF @var84 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var84 + '];');
ALTER TABLE [Cantiere] ALTER COLUMN [cap] int NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211004185819_aggiustatocap', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var85 sysname;
SELECT @var85 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'startDate');
IF @var85 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var85 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [startDate] datetime2 NULL;
GO

DECLARE @var86 sysname;
SELECT @var86 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'endingDate');
IF @var86 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var86 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [endingDate] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211004190521_aggiustataImpostazioneDataNullableSuiContratti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var87 sysname;
SELECT @var87 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[VehicleCard]') AND [c].[name] = N'NumberOfHoursOfUsage');
IF @var87 IS NOT NULL EXEC(N'ALTER TABLE [VehicleCard] DROP CONSTRAINT [' + @var87 + '];');
ALTER TABLE [VehicleCard] ALTER COLUMN [NumberOfHoursOfUsage] float NULL;
GO

DECLARE @var88 sysname;
SELECT @var88 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[VehicleCard]') AND [c].[name] = N'BeginningDate');
IF @var88 IS NOT NULL EXEC(N'ALTER TABLE [VehicleCard] DROP CONSTRAINT [' + @var88 + '];');
ALTER TABLE [VehicleCard] ALTER COLUMN [BeginningDate] datetime2 NULL;
GO

DECLARE @var89 sysname;
SELECT @var89 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TimeCard]') AND [c].[name] = N'NumberOfHours');
IF @var89 IS NOT NULL EXEC(N'ALTER TABLE [TimeCard] DROP CONSTRAINT [' + @var89 + '];');
ALTER TABLE [TimeCard] ALTER COLUMN [NumberOfHours] float NOT NULL;
GO

DECLARE @var90 sysname;
SELECT @var90 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TimeCard]') AND [c].[name] = N'BeginningDate');
IF @var90 IS NOT NULL EXEC(N'ALTER TABLE [TimeCard] DROP CONSTRAINT [' + @var90 + '];');
ALTER TABLE [TimeCard] ALTER COLUMN [BeginningDate] datetime2 NULL;
GO

ALTER TABLE [DocumentsList] ADD [type] int NOT NULL DEFAULT 0;
GO

DECLARE @var91 sysname;
SELECT @var91 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'contractCode');
IF @var91 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var91 + '];');
ALTER TABLE [Contratto] ALTER COLUMN [contractCode] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211012151023_UpdateModelliReportDiCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [DocumentsList] DROP CONSTRAINT [FK_DocumentsList_Cantiere_IdCantiere];
GO

ALTER TABLE [DocumentsList] DROP CONSTRAINT [FK_DocumentsList_File_IdFile];
GO

DROP INDEX [IX_DocumentsList_IdCantiere] ON [DocumentsList];
GO

DECLARE @var92 sysname;
SELECT @var92 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DocumentsList]') AND [c].[name] = N'IdCantiere');
IF @var92 IS NOT NULL EXEC(N'ALTER TABLE [DocumentsList] DROP CONSTRAINT [' + @var92 + '];');
ALTER TABLE [DocumentsList] DROP COLUMN [IdCantiere];
GO

EXEC sp_rename N'[DocumentsList].[IdFile]', N'IdFileDiCantiere', N'COLUMN';
GO

EXEC sp_rename N'[DocumentsList].[IX_DocumentsList_IdFile]', N'IX_DocumentsList_IdFileDiCantiere', N'INDEX';
GO

DECLARE @var93 sysname;
SELECT @var93 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DocumentsList]') AND [c].[name] = N'type');
IF @var93 IS NOT NULL EXEC(N'ALTER TABLE [DocumentsList] DROP CONSTRAINT [' + @var93 + '];');
ALTER TABLE [DocumentsList] ALTER COLUMN [type] nvarchar(max) NULL;
GO

ALTER TABLE [DocumentsList] ADD CONSTRAINT [FK_DocumentsList_ListaFileDiCantiere_IdFileDiCantiere] FOREIGN KEY ([IdFileDiCantiere]) REFERENCES [ListaFileDiCantiere] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211105231725_CancellatoCanitereDiAppartenza', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] ADD [Author] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211106081432_aggiuntoAutoreSuReportDiCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var94 sysname;
SELECT @var94 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'netAmountFattura');
IF @var94 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var94 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [netAmountFattura] float NOT NULL;
GO

DECLARE @var95 sysname;
SELECT @var95 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'netAmountCP');
IF @var95 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var95 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [netAmountCP] float NOT NULL;
GO

DECLARE @var96 sysname;
SELECT @var96 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'ivaAmountFattura');
IF @var96 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var96 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [ivaAmountFattura] float NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211119155437_correttaSaltura', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var97 sysname;
SELECT @var97 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'dataScadenzaFattura');
IF @var97 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var97 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [dataScadenzaFattura] datetime2 NULL;
GO

DECLARE @var98 sysname;
SELECT @var98 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'dataIncassoFattura');
IF @var98 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var98 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [dataIncassoFattura] datetime2 NULL;
GO

DECLARE @var99 sysname;
SELECT @var99 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'dataEmissioneSAL');
IF @var99 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var99 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [dataEmissioneSAL] datetime2 NULL;
GO

DECLARE @var100 sysname;
SELECT @var100 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'dataEmissioneFattura');
IF @var100 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var100 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [dataEmissioneFattura] datetime2 NULL;
GO

DECLARE @var101 sysname;
SELECT @var101 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'dataEmissioneCP');
IF @var101 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var101 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [dataEmissioneCP] datetime2 NULL;
GO

ALTER TABLE [Saltura] ADD [endingReferralPeriodDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Saltura] ADD [startingReferralPeriodDate] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211201140612_upaedSaturastuf', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Saltura] DROP CONSTRAINT [FK_Saltura_Cantiere_IdCantiere];
GO

DECLARE @var102 sysname;
SELECT @var102 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'startingReferralPeriodDate');
IF @var102 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var102 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [startingReferralPeriodDate] datetime2 NULL;
GO

DECLARE @var103 sysname;
SELECT @var103 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'netAmountFattura');
IF @var103 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var103 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [netAmountFattura] float NULL;
GO

DECLARE @var104 sysname;
SELECT @var104 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'netAmountCP');
IF @var104 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var104 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [netAmountCP] float NULL;
GO

DECLARE @var105 sysname;
SELECT @var105 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'ivaAmountFattura');
IF @var105 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var105 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [ivaAmountFattura] float NULL;
GO

DECLARE @var106 sysname;
SELECT @var106 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'endingReferralPeriodDate');
IF @var106 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var106 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [endingReferralPeriodDate] datetime2 NULL;
GO

DECLARE @var107 sysname;
SELECT @var107 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'delayDaysFattura');
IF @var107 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var107 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [delayDaysFattura] int NULL;
GO

DECLARE @var108 sysname;
SELECT @var108 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'IdCantiere');
IF @var108 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var108 + '];');
ALTER TABLE [Saltura] ALTER COLUMN [IdCantiere] int NULL;
GO

ALTER TABLE [Saltura] ADD CONSTRAINT [FK_Saltura_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211201142522_noSalturaFieldIsCompulsory', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [FinancialCard] ADD [ProxSal] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211204124718_aggiornateFinanacialCardCosìDaIncludereProxSal', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Budget] (
    [id] int NOT NULL IDENTITY,
    [RicaviPrevisionali] float NOT NULL,
    [CostiPrevisionali] float NOT NULL,
    [UtilePrevisionale] float NOT NULL,
    [RicaviConsuntivi] float NOT NULL,
    [CostiConsuntivi] float NOT NULL,
    [UtileConsuntivo] float NOT NULL,
    [PercentualeRicavi] int NOT NULL,
    [CostiPercentuale] int NOT NULL,
    [UtilePercentuale] int NOT NULL,
    [IdCantiere] int NOT NULL,
    CONSTRAINT [PK_Budget] PRIMARY KEY ([id]),
    CONSTRAINT [FK_Budget_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Budget_IdCantiere] ON [Budget] ([IdCantiere]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211204175152_AggiuntoBudget', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var109 sysname;
SELECT @var109 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'UtilePercentuale');
IF @var109 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var109 + '];');
ALTER TABLE [Budget] ALTER COLUMN [UtilePercentuale] real NOT NULL;
GO

DECLARE @var110 sysname;
SELECT @var110 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'PercentualeRicavi');
IF @var110 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var110 + '];');
ALTER TABLE [Budget] ALTER COLUMN [PercentualeRicavi] real NOT NULL;
GO

DECLARE @var111 sysname;
SELECT @var111 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'CostiPercentuale');
IF @var111 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var111 + '];');
ALTER TABLE [Budget] ALTER COLUMN [CostiPercentuale] real NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211205174514_AggiuntoBudgetAggiustato', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var112 sysname;
SELECT @var112 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ReportDiCantiere]') AND [c].[name] = N'JObject');
IF @var112 IS NOT NULL EXEC(N'ALTER TABLE [ReportDiCantiere] DROP CONSTRAINT [' + @var112 + '];');
ALTER TABLE [ReportDiCantiere] DROP COLUMN [JObject];
GO

CREATE TABLE [AllegatiEQuestionarioReportModel] (
    [Id] int NOT NULL IDENTITY,
    [commenti] nvarchar(max) NOT NULL,
    [fornitori] nvarchar(max) NOT NULL,
    [meteo] nvarchar(max) NOT NULL,
    [mezzi] nvarchar(max) NOT NULL,
    [risorseUmane] nvarchar(max) NOT NULL,
    [IdReport] int NOT NULL,
    CONSTRAINT [PK_AllegatiEQuestionarioReportModel] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AllegatiEQuestionarioReportModel_ReportDiCantiere_IdReport] FOREIGN KEY ([IdReport]) REFERENCES [ReportDiCantiere] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AllegatiEQuestionarioReportModel_IdReport] ON [AllegatiEQuestionarioReportModel] ([IdReport]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211227082748_ModificataGerstioneQuestionario', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [AllegatiEQuestionarioReportModel] ADD [commentiAttrezzatureMezzi] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [AllegatiEQuestionarioReportModel] ADD [commentiFornitori] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [AllegatiEQuestionarioReportModel] ADD [commentiMeteo] nvarchar(max) NOT NULL DEFAULT N'';
GO

ALTER TABLE [AllegatiEQuestionarioReportModel] ADD [commentiRisorseUmane] nvarchar(max) NOT NULL DEFAULT N'';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211227083717_AggiuntiCommentiSuQuestionario', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [PrezziarioCliente] ADD [IdCliente] int NULL;
GO

ALTER TABLE [PrezziarioCliente] ADD [clienteName] nvarchar(max) NULL;
GO

CREATE INDEX [IX_PrezziarioCliente_IdCliente] ON [PrezziarioCliente] ([IdCliente]);
GO

ALTER TABLE [PrezziarioCliente] ADD CONSTRAINT [FK_PrezziarioCliente_Clienti_IdCliente] FOREIGN KEY ([IdCliente]) REFERENCES [Clienti] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220105212943_AggiustateInfoPrezziario', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] ADD [referenceDay] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220107170100_ReferenceDayAddedToReportDiCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

EXEC sp_rename N'[ReportDiCantiere].[referenceDay]', N'referenceDate', N'COLUMN';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220107170318_referenceDayCambiatoInReferenceDate', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var113 sysname;
SELECT @var113 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Cantiere]') AND [c].[name] = N'orderAmount');
IF @var113 IS NOT NULL EXEC(N'ALTER TABLE [Cantiere] DROP CONSTRAINT [' + @var113 + '];');
ALTER TABLE [Cantiere] ALTER COLUMN [orderAmount] float NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220107170541_orderamountoraèfloat', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var114 sysname;
SELECT @var114 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PrezziarioCliente]') AND [c].[name] = N'clienteName');
IF @var114 IS NOT NULL EXEC(N'ALTER TABLE [PrezziarioCliente] DROP CONSTRAINT [' + @var114 + '];');
ALTER TABLE [PrezziarioCliente] DROP COLUMN [clienteName];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220114101316_rimossoClientNameDaModelloPrezziarioCliente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Contratto] DROP CONSTRAINT [FK_Contratto_PrezziarioCliente_IdPrezziarioCliente];
GO

DROP INDEX [IX_Contratto_IdPrezziarioCliente] ON [Contratto];
GO

DECLARE @var115 sysname;
SELECT @var115 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contratto]') AND [c].[name] = N'IdPrezziarioCliente');
IF @var115 IS NOT NULL EXEC(N'ALTER TABLE [Contratto] DROP CONSTRAINT [' + @var115 + '];');
ALTER TABLE [Contratto] DROP COLUMN [IdPrezziarioCliente];
GO

CREATE TABLE [ListaPrezzariContratto] (
    [Id] int NOT NULL IDENTITY,
    [IdContratto] int NOT NULL,
    [IdPrezziario] int NOT NULL,
    CONSTRAINT [PK_ListaPrezzariContratto] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ListaPrezzariContratto_Contratto_IdContratto] FOREIGN KEY ([IdContratto]) REFERENCES [Contratto] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ListaPrezzariContratto_PrezziarioCliente_IdPrezziario] FOREIGN KEY ([IdPrezziario]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ListaPrezzariContratto_IdContratto] ON [ListaPrezzariContratto] ([IdContratto]);
GO

CREATE INDEX [IX_ListaPrezzariContratto_IdPrezziario] ON [ListaPrezzariContratto] ([IdPrezziario]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220114170817_ModificataGestionePrezziariNeiContratti', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Contratto] ADD [IdPrezziarioCliente] int NULL;
GO

CREATE INDEX [IX_Contratto_IdPrezziarioCliente] ON [Contratto] ([IdPrezziarioCliente]);
GO

ALTER TABLE [Contratto] ADD CONSTRAINT [FK_Contratto_PrezziarioCliente_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [PrezziarioCliente] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220114215321_AggiuntaRetrocompatibilitContratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var116 sysname;
SELECT @var116 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'risorseUmane');
IF @var116 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var116 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [risorseUmane] nvarchar(max) NULL;
GO

DECLARE @var117 sysname;
SELECT @var117 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'mezzi');
IF @var117 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var117 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [mezzi] nvarchar(max) NULL;
GO

DECLARE @var118 sysname;
SELECT @var118 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'meteo');
IF @var118 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var118 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [meteo] nvarchar(max) NULL;
GO

DECLARE @var119 sysname;
SELECT @var119 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'fornitori');
IF @var119 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var119 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [fornitori] nvarchar(max) NULL;
GO

DECLARE @var120 sysname;
SELECT @var120 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'commentiRisorseUmane');
IF @var120 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var120 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [commentiRisorseUmane] nvarchar(max) NULL;
GO

DECLARE @var121 sysname;
SELECT @var121 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'commentiMeteo');
IF @var121 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var121 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [commentiMeteo] nvarchar(max) NULL;
GO

DECLARE @var122 sysname;
SELECT @var122 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'commentiFornitori');
IF @var122 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var122 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [commentiFornitori] nvarchar(max) NULL;
GO

DECLARE @var123 sysname;
SELECT @var123 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'commentiAttrezzatureMezzi');
IF @var123 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var123 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [commentiAttrezzatureMezzi] nvarchar(max) NULL;
GO

DECLARE @var124 sysname;
SELECT @var124 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[AllegatiEQuestionarioReportModel]') AND [c].[name] = N'commenti');
IF @var124 IS NOT NULL EXEC(N'ALTER TABLE [AllegatiEQuestionarioReportModel] DROP CONSTRAINT [' + @var124 + '];');
ALTER TABLE [AllegatiEQuestionarioReportModel] ALTER COLUMN [commenti] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220115095845_NullableSuMezzi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var125 sysname;
SELECT @var125 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Saltura]') AND [c].[name] = N'delayDaysFattura');
IF @var125 IS NOT NULL EXEC(N'ALTER TABLE [Saltura] DROP CONSTRAINT [' + @var125 + '];');
ALTER TABLE [Saltura] DROP COLUMN [delayDaysFattura];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220115130539_rimossoDelayFatturaDaPresenza', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [WordsCounter] (
    [Id] int NOT NULL IDENTITY,
    [IdPrezziarioCliente] int NOT NULL,
    [word] nvarchar(max) NULL,
    [idServizioCliente] int NOT NULL,
    [counter] int NOT NULL,
    CONSTRAINT [PK_WordsCounter] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WordsCounter_PrezziarioCliente_IdPrezziarioCliente] FOREIGN KEY ([IdPrezziarioCliente]) REFERENCES [PrezziarioCliente] ([Id]),
    CONSTRAINT [FK_WordsCounter_ServizioCliente_idServizioCliente] FOREIGN KEY ([idServizioCliente]) REFERENCES [ServizioCliente] ([ID]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_WordsCounter_IdPrezziarioCliente] ON [WordsCounter] ([IdPrezziarioCliente]);
GO

CREATE INDEX [IX_WordsCounter_idServizioCliente] ON [WordsCounter] ([idServizioCliente]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220121151020_AggiuntoIndexerPerServiziClienteInPrezziarioClienteBis', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [ShortDescription] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220213172242_AggiuntoCampoDescrizioneBreve', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ProfileManagement] (
    [Id] int NOT NULL IDENTITY,
    [IdUser] nvarchar(450) NULL,
    [IdPersonale] int NOT NULL,
    CONSTRAINT [PK_ProfileManagement] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProfileManagement_AspNetUsers_IdUser] FOREIGN KEY ([IdUser]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ProfileManagement_Personale_IdPersonale] FOREIGN KEY ([IdPersonale]) REFERENCES [Personale] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_ProfileManagement_IdPersonale] ON [ProfileManagement] ([IdPersonale]);
GO

CREATE UNIQUE INDEX [IX_ProfileManagement_IdUser] ON [ProfileManagement] ([IdUser]) WHERE [IdUser] IS NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220403152336_AggiuntaTabellaDiCollegamentoUserPersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ProfileManagement] ADD [isEnabled] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220410164230_AggiuntoCampoIsUserEnabledSuProfileManagement', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE INDEX [IX_Personale_email] ON [Personale] ([email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220416104348_IndexedEmailPersonale', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_Personale_email] ON [Personale];
GO

CREATE NONCLUSTERED INDEX [IX_Personale_email] ON [Personale] ([email]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220421162504_FixingEmailIndex', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Budget] ADD [DataFine] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [Budget] ADD [DataInizio] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220805143710_AggiunteDateInizioEFineABudget', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [FinancialCard] ADD [cashflow] float NOT NULL DEFAULT 0.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220826184614_AggiuntoCashflowAFinancialCard', N'8.0.7');
GO

COMMIT;
GO

CREATE FULLTEXT CATALOG ServizioClienteCatalog as default;
GO

create fulltext index on ServizioCliente (Description language 1040 , rateCode language 1040) key index PK_ServizioCliente with stoplist=off
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20231005204016_FullTextIndex_ServizioCliente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Cantiere] ADD [percentualeSpeseGenerali] float NOT NULL DEFAULT 0.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20231020160452_AddPercentualeSpeseGeneraliToCantiere', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] ADD [IsDraft] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20231104160407_TableReportDiCantiere_AddedColumn_IsDraft', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ServizioCliente] ADD [ApplyDiscount] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [PrezziarioCliente] ADD [DiscountPercentage] float NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20231112152309_AddedColumnScontoInPrezzarioAndApplyDiscountInServizioCliente', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_ListaPrezzariContratto_IdContratto] ON [ListaPrezzariContratto];
GO

CREATE UNIQUE INDEX [IX_ListaPrezzariContratto_IdContratto_IdPrezziario] ON [ListaPrezzariContratto] ([IdContratto], [IdPrezziario]);
GO

insert into ListaPrezzariContratto(IdContratto, IdPrezziario) select id,IdPrezziarioCliente from Contratto order by Id, IdPrezziarioCliente
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20231119141206_AddedUniqueIndexOnTableListaPrezzariContatto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_Personale_email] ON [Personale];
GO

CREATE UNIQUE NONCLUSTERED INDEX [IX_Personale_email] ON [Personale] ([email]) WHERE [email] IS NOT NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240227215552_TablePersonaleAddedIndexEmailUnique', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Parameters] (
    [Key] nvarchar(100) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_Parameters] PRIMARY KEY ([Key])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240302093939_AddedtableSystemParameters', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var126 sysname;
SELECT @var126 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ReportDiCantiere]') AND [c].[name] = N'IsDraft');
IF @var126 IS NOT NULL EXEC(N'ALTER TABLE [ReportDiCantiere] DROP CONSTRAINT [' + @var126 + '];');
ALTER TABLE [ReportDiCantiere] DROP COLUMN [IsDraft];
GO

ALTER TABLE [ReportDiCantiere] ADD [Status] int NOT NULL DEFAULT 0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240319211703_ReportDiCantiereAddedColumnStatus', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] ADD [Counter] int NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240411183346_TableReportDiCantiereAddedColumnCounter', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_Budget_IdCantiere] ON [Budget];
GO

DECLARE @var127 sysname;
SELECT @var127 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'CostiConsuntivi');
IF @var127 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var127 + '];');
ALTER TABLE [Budget] DROP COLUMN [CostiConsuntivi];
GO

DECLARE @var128 sysname;
SELECT @var128 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'CostiPercentuale');
IF @var128 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var128 + '];');
ALTER TABLE [Budget] DROP COLUMN [CostiPercentuale];
GO

DECLARE @var129 sysname;
SELECT @var129 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'CostiPrevisionali');
IF @var129 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var129 + '];');
ALTER TABLE [Budget] DROP COLUMN [CostiPrevisionali];
GO

DECLARE @var130 sysname;
SELECT @var130 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'DataFine');
IF @var130 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var130 + '];');
ALTER TABLE [Budget] DROP COLUMN [DataFine];
GO

DECLARE @var131 sysname;
SELECT @var131 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'DataInizio');
IF @var131 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var131 + '];');
ALTER TABLE [Budget] DROP COLUMN [DataInizio];
GO

DECLARE @var132 sysname;
SELECT @var132 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'PercentualeRicavi');
IF @var132 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var132 + '];');
ALTER TABLE [Budget] DROP COLUMN [PercentualeRicavi];
GO

DECLARE @var133 sysname;
SELECT @var133 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'RicaviConsuntivi');
IF @var133 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var133 + '];');
ALTER TABLE [Budget] DROP COLUMN [RicaviConsuntivi];
GO

DECLARE @var134 sysname;
SELECT @var134 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'RicaviPrevisionali');
IF @var134 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var134 + '];');
ALTER TABLE [Budget] DROP COLUMN [RicaviPrevisionali];
GO

DECLARE @var135 sysname;
SELECT @var135 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'UtileConsuntivo');
IF @var135 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var135 + '];');
ALTER TABLE [Budget] DROP COLUMN [UtileConsuntivo];
GO

DECLARE @var136 sysname;
SELECT @var136 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'UtilePercentuale');
IF @var136 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var136 + '];');
ALTER TABLE [Budget] DROP COLUMN [UtilePercentuale];
GO

DECLARE @var137 sysname;
SELECT @var137 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Budget]') AND [c].[name] = N'UtilePrevisionale');
IF @var137 IS NOT NULL EXEC(N'ALTER TABLE [Budget] DROP CONSTRAINT [' + @var137 + '];');
ALTER TABLE [Budget] DROP COLUMN [UtilePrevisionale];
GO

EXEC sp_rename N'[Budget].[id]', N'Id', N'COLUMN';
GO

CREATE TABLE [BudgetCapitolo] (
    [Id] int NOT NULL IDENTITY,
    [IdBudget] int NOT NULL,
    [Capitolo] nvarchar(max) NULL,
    CONSTRAINT [PK_BudgetCapitolo] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BudgetCapitolo_Budget_IdBudget] FOREIGN KEY ([IdBudget]) REFERENCES [Budget] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [BudgetAttivita] (
    [Id] int NOT NULL IDENTITY,
    [IdCapitolo] int NOT NULL,
    [IdFornitore] int NOT NULL,
    [Attivita] nvarchar(max) NOT NULL,
    [Ricavi] float NOT NULL,
    [Costi] float NOT NULL,
    [Margine] float NOT NULL,
    [PercentualeRicavi] float NOT NULL,
    CONSTRAINT [PK_BudgetAttivita] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BudgetAttivita_BudgetCapitolo_IdCapitolo] FOREIGN KEY ([IdCapitolo]) REFERENCES [BudgetCapitolo] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_BudgetAttivita_Fornitori_IdFornitore] FOREIGN KEY ([IdFornitore]) REFERENCES [Fornitori] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_Budget_IdCantiere] ON [Budget] ([IdCantiere]);
GO

CREATE INDEX [IX_BudgetAttivita_IdCapitolo] ON [BudgetAttivita] ([IdCapitolo]);
GO

CREATE INDEX [IX_BudgetAttivita_IdFornitore] ON [BudgetAttivita] ([IdFornitore]);
GO

CREATE INDEX [IX_BudgetCapitolo_IdBudget] ON [BudgetCapitolo] ([IdBudget]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240427131410_AddedTablesBudgetCapitolo_BudgetAttivita', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AttachmentsBudget] (
    [Id] int NOT NULL IDENTITY,
    [IdAttivitaBudget] int NOT NULL,
    [IdFile] int NOT NULL,
    CONSTRAINT [PK_AttachmentsBudget] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AttachmentsBudget_BudgetAttivita_IdAttivitaBudget] FOREIGN KEY ([IdAttivitaBudget]) REFERENCES [BudgetAttivita] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AttachmentsBudget_File_IdFile] FOREIGN KEY ([IdFile]) REFERENCES [File] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AttachmentsBudget_IdAttivitaBudget] ON [AttachmentsBudget] ([IdAttivitaBudget]);
GO

CREATE INDEX [IX_AttachmentsBudget_IdFile] ON [AttachmentsBudget] ([IdFile]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240428203933_AddedTable_AttachmentsBudget', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [BudgetAttivita] DROP CONSTRAINT [FK_BudgetAttivita_Fornitori_IdFornitore];
GO

DECLARE @var138 sysname;
SELECT @var138 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[BudgetAttivita]') AND [c].[name] = N'IdFornitore');
IF @var138 IS NOT NULL EXEC(N'ALTER TABLE [BudgetAttivita] DROP CONSTRAINT [' + @var138 + '];');
ALTER TABLE [BudgetAttivita] ALTER COLUMN [IdFornitore] int NULL;
GO

ALTER TABLE [BudgetAttivita] ADD CONSTRAINT [FK_BudgetAttivita_Fornitori_IdFornitore] FOREIGN KEY ([IdFornitore]) REFERENCES [Fornitori] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240514193622_BudgetAttivita_FornitoreNotRequired', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ListOfServicesSoldToClient] ADD [EqualParts] float NOT NULL DEFAULT 1.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240519163542_TableListOfServicesSoldToClient_AddedColumnEqualParts', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var139 sysname;
SELECT @var139 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ListOfServicesSoldToClient]') AND [c].[name] = N'EqualParts');
IF @var139 IS NOT NULL EXEC(N'ALTER TABLE [ListOfServicesSoldToClient] DROP CONSTRAINT [' + @var139 + '];');
GO

ALTER TABLE [Cantiere] ADD [CostiIniziali] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [RicaviIniziali] float NOT NULL DEFAULT 0.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240611193015_TableCantieri_AddedColumnsCostiIniziali_RicaviIniziali', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ValoriAggiuntivi] (
    [Id] int NOT NULL IDENTITY,
    [AdditionalGrossWorkAmount] float NOT NULL,
    [AdditionalChargesAmount] float NOT NULL,
    [AdditionalNetAmount] float NOT NULL,
    [AdditionalSolarDays] float NOT NULL,
    [Data] datetime2 NOT NULL,
    [CodiceContratto] nvarchar(50) NULL,
    [IdCantiere] int NULL,
    [IdContratto] int NULL,
    CONSTRAINT [PK_ValoriAggiuntivi] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ValoriAggiuntivi_Cantiere_IdCantiere] FOREIGN KEY ([IdCantiere]) REFERENCES [Cantiere] ([Id]),
    CONSTRAINT [FK_ValoriAggiuntivi_Contratto_IdContratto] FOREIGN KEY ([IdContratto]) REFERENCES [Contratto] ([Id])
);
GO

CREATE INDEX [IX_ValoriAggiuntivi_IdCantiere] ON [ValoriAggiuntivi] ([IdCantiere]);
GO

CREATE INDEX [IX_ValoriAggiuntivi_IdContratto] ON [ValoriAggiuntivi] ([IdContratto]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240623154151_AddedTableValoriAggiuntivi_Cantiere_Contratto', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var140 sysname;
SELECT @var140 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ValoriAggiuntivi]') AND [c].[name] = N'Data');
IF @var140 IS NOT NULL EXEC(N'ALTER TABLE [ValoriAggiuntivi] DROP CONSTRAINT [' + @var140 + '];');
ALTER TABLE [ValoriAggiuntivi] ALTER COLUMN [Data] datetime2 NULL;
GO

ALTER TABLE [Cantiere] ADD [TotalChargesAmount] float NOT NULL DEFAULT 0.0E0;
GO

ALTER TABLE [Cantiere] ADD [TotalGrossWorkAmount] float NOT NULL DEFAULT 0.0E0;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240703201931_TableCantieri_AddedTotalGrossWorkAmount_TotalChargesAmount_TableValoriAggiuntivi_DateNotRequired', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ReportDiCantiere] ADD [ApprovalAuthor] nvarchar(max) NULL;
GO

ALTER TABLE [ReportDiCantiere] ADD [ApprovalDate] datetime2 NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240820110522_TableReportDiCantiere_AddedColumnsApprovalDate_ApprovalAuthor', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ListOfServicesSoldToClient] ADD [Height] float NULL;
GO

ALTER TABLE [ListOfServicesSoldToClient] ADD [Length] float NULL;
GO

ALTER TABLE [ListOfServicesSoldToClient] ADD [Width] float NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240901080514_TableListOfServicesSoldToClient_AddedColumnsLength_Width_Heigth', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var141 sysname;
SELECT @var141 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Personale]') AND [c].[name] = N'CF');
IF @var141 IS NOT NULL EXEC(N'ALTER TABLE [Personale] DROP CONSTRAINT [' + @var141 + '];');
ALTER TABLE [Personale] ALTER COLUMN [CF] nvarchar(50) NULL;
GO

DECLARE @var142 sysname;
SELECT @var142 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'Model');
IF @var142 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var142 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [Model] nvarchar(max) NULL;
GO

DECLARE @var143 sysname;
SELECT @var143 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'LicensePlate');
IF @var143 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var143 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [LicensePlate] nvarchar(max) NULL;
GO

DECLARE @var144 sysname;
SELECT @var144 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'DailyCost');
IF @var144 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var144 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [DailyCost] float NULL;
GO

DECLARE @var145 sysname;
SELECT @var145 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Mezzi]') AND [c].[name] = N'Brand');
IF @var145 IS NOT NULL EXEC(N'ALTER TABLE [Mezzi] DROP CONSTRAINT [' + @var145 + '];');
ALTER TABLE [Mezzi] ALTER COLUMN [Brand] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240918195009_Add-nullable-values-to-Personale-and-Mezzi', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [TimeCard] DROP CONSTRAINT [FK_TimeCard_Personale_PersonaleId];
GO

ALTER TABLE [TimeCard] ADD CONSTRAINT [FK_TimeCard_Personale_PersonaleId] FOREIGN KEY ([PersonaleId]) REFERENCES [Personale] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240922140136_TableTimeCard_FKPersonale_OnDeleteNoAction', N'8.0.7');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [TimeCard] ADD [AbsenceReason] nvarchar(255) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240925184915_TableTimeCard_AddedCOlumn_AbsenceReason', N'8.0.7');
GO

COMMIT;
GO

