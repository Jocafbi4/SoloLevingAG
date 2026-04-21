import java.util.Scanner;

public class Sistema {
    private Jogador jogador;

    public void iniciar() {
        jogador = new Jogador("Jogador");

        System.out.println("⚔ SISTEMA ATIVADO");
        System.out.println("Bem-vindo ao seu sistema de evolução.\n");

        Scanner sc = new Scanner(System.in);

        System.out.println("Relatório do dia:");

        System.out.print("Treinou hoje? (s/n): ");
        boolean treino = sc.nextLine().equalsIgnoreCase("s");

        System.out.print("Meditou hoje? (s/n): ");
        boolean meditacao = sc.nextLine().equalsIgnoreCase("s");

        System.out.print("Horas de programação: ");
        int horas = sc.nextInt();

        System.out.print("Trabalhou no projeto? (s/n): ");
        boolean projeto = sc.next().equalsIgnoreCase("s");

        Relatorio relatorio = new Relatorio(treino, meditacao, horas, projeto);

        processarRelatorio(relatorio);
    }

    private void processarRelatorio(Relatorio r) {
        int xp = 0;

        if (r.isTreino()) {
            xp += 50;
            jogador.getAtributos().addForca(5);
        } else {
            xp -= 50;
        }

        if (r.isMeditacao()) {
            xp += 30;
            jogador.getAtributos().addMental(5);
        } else {
            xp -= 30;
        }

        if (r.getHorasProgramacao() >= 3) {
            xp += 300;
            jogador.getAtributos().addIntelecto(10);
        } else {
            xp -= 80;
        }

        if (r.isProjeto()) {
            xp += 200;
        }

        jogador.addXP(xp);

        exibirStatus(xp);
    }

    private void exibirStatus(int xpGanho) {
        System.out.println("\n⚔ RESULTADO DO DIA:");
        System.out.println("XP ganho: " + xpGanho);
        System.out.println("Nível: " + jogador.getNivel());
        System.out.println("XP total: " + jogador.getXp());

        System.out.println("\n📊 ATRIBUTOS:");
        System.out.println(jogador.getAtributos());
    }
}