{ pkgs, ... }:

{
  # https://devenv.sh/packages/
  packages = with pkgs; [
    git
    supabase-cli
    corepack
    dbmate
    docker
    prettierd
    eslint_d
    postgresql_16
  ];

  # https://devenv.sh/languages/
  languages.typescript.enable = true;

  env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable";
  env.DBMATE_MIGRATIONS_DIR = "./supabase/migrations";
  env.DBMATE_SCHEMA_FILE = "./supabase/schema.sql";

  enterShell = ''
    echo
    echo Starting prettierd...
    echo ${pkgs.prettierd}/bin/prettierd start
    echo prettierd started
    echo
    echo Starting eslint_d...
    echo ${pkgs.eslint_d}/bin/eslint_d start
    echo eslint_d started
    echo
  '';

  # https://devenv.sh/pre-commit-hooks/
  # pre-commit.hooks.shellcheck.enable = true;

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";
  processes = {
    supabase.exec = "${pkgs.supabase-cli}/bin/supabase stop && ${pkgs.supabase-cli}/bin/supabase start";
    localias.exec = "localias stop && localias start";
  };

  # processes = {
  # prettierd.exec = "prettierd restart";
  # eslintd.exec = "eslint_d restart";
  # };

  # See full reference at https://devenv.sh/reference/options/
}
