public class Atributos {
    private int forca;
    private int intelecto;
    private int mental;

    public void addForca(int v) {
        this.forca += v;
    }

    public void addIntelecto(int v) {
        this.intelecto += v;
    }

    public void addMental(int v) {
        this.mental += v;
    }

    @Override
    public String toString() {
        return "Força: " + forca +
                " | Intelecto: " + intelecto +
                " | Mental: " + mental;
    }
}