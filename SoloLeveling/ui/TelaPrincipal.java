import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class TelaPrincipal {

    private Jogador jogador = new Jogador("Jogador");

    public void mostrar(Stage stage) {

        Label titulo = new Label("⚔ Sistema de Evolução");

        CheckBox treino = new CheckBox("Treino realizado");
        CheckBox meditacao = new CheckBox("Meditação realizada");
        CheckBox projeto = new CheckBox("Trabalhou no projeto");

        TextField horas = new TextField();
        horas.setPromptText("Horas de programação");

        Button executar = new Button("Executar Missão");

        Label resultado = new Label();

        executar.setOnAction(e -> {
            try {
                int h = Integer.parseInt(horas.getText());

                Relatorio r = new Relatorio(
                        treino.isSelected(),
                        meditacao.isSelected(),
                        h,
                        projeto.isSelected()
                );

                int xp = processar(r);

                resultado.setText(
                        "XP: " + xp +
                                "\nNível: " + jogador.getNivel() +
                                "\nAtributos: " + jogador.getAtributos()
                );

            } catch (Exception ex) {
                resultado.setText("Erro: insira um número válido.");
            }
        });

        VBox layout = new VBox(10);
        layout.setPadding(new Insets(20));

        layout.getChildren().addAll(
                titulo,
                treino,
                meditacao,
                projeto,
                horas,
                executar,
                resultado
        );

        Scene scene = new Scene(layout, 350, 400);

        stage.setTitle("Sistema Solo Leveling");
        stage.setScene(scene);
        stage.show();
    }

    private int processar(Relatorio r) {
        int xp = 0;

        if (r.isTreino()) {
            xp += 50;
            jogador.getAtributos().addForca(5);
        } else xp -= 50;

        if (r.isMeditacao()) {
            xp += 30;
            jogador.getAtributos().addMental(5);
        } else xp -= 30;

        if (r.getHorasProgramacao() >= 3) {
            xp += 300;
            jogador.getAtributos().addIntelecto(10);
        } else xp -= 80;

        if (r.isProjeto()) xp += 200;

        jogador.addXP(xp);

        return xp;
    }
}