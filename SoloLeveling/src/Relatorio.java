public class Relatorio {
    private boolean treino;
    private boolean meditacao;
    private int horasProgramacao;
    private boolean projeto;

    public Relatorio(boolean treino, boolean meditacao, int horasProgramacao, boolean projeto) {
        this.treino = treino;
        this.meditacao = meditacao;
        this.horasProgramacao = horasProgramacao;
        this.projeto = projeto;
    }

    public boolean isTreino() {
        return treino;
    }

    public boolean isMeditacao() {
        return meditacao;
    }

    public int getHorasProgramacao() {
        return horasProgramacao;
    }

    public boolean isProjeto() {
        return projeto;
    }
}