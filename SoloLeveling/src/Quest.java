public class Quest {
    private String descricao;
    private boolean concluida;

    public Quest(String descricao) {
        this.descricao = descricao;
        this.concluida = false;
    }

    public void concluir() {
        this.concluida = true;
    }
}