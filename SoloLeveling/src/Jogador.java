public class Jogador {
    private String nome;
    private int xp;
    private int nivel;
    private Atributos atributos;

    public Jogador(String nome) {
        this.nome = nome;
        this.xp = 0;
        this.nivel = 1;
        this.atributos = new Atributos();
    }

    public void addXP(int valor) {
        this.xp += valor;
        calcularNivel();
    }

    private void calcularNivel() {
        this.nivel = (xp / 500) + 1;
    }

    public int getXp() {
        return xp;
    }

    public int getNivel() {
        return nivel;
    }

    public Atributos getAtributos() {
        return atributos;
    }
}